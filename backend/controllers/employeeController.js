const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../utils/email');
const { serializeEmployee } = require('../utils/serializers');

const INCLUDE = {
  user: true,
  department: true,
  manager: { include: { user: true } },
};

const listEmployees = asyncHandler(async (req, res) => {
  const {
    page = 1, page_size: pageSize = 10, search, department_id: departmentId, status,
    sort_by: sortBy = 'full_name', sort_dir: sortDir = 'asc',
  } = req.query;

  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { employeeCode: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const orderBy = sortBy === 'full_name' ? { user: { fullName: sortDir === 'desc' ? 'desc' : 'asc' } }
    : sortBy === 'email' ? { user: { email: sortDir === 'desc' ? 'desc' : 'asc' } }
    : { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' };

  const skip = (Number(page) - 1) * Number(pageSize);
  const [docs, total] = await Promise.all([
    prisma.employee.findMany({ where, include: INCLUDE, orderBy, skip, take: Number(pageSize) }),
    prisma.employee.count({ where }),
  ]);
  res.json({
    items: docs.map(serializeEmployee), total, page: Number(page), page_size: Number(pageSize),
    total_pages: Math.max(1, Math.ceil(total / Number(pageSize))),
  });
});

const getEmployee = asyncHandler(async (req, res) => {
  const emp = await prisma.employee.findUnique({ where: { id: req.params.id }, include: INCLUDE });
  if (!emp) throw new ApiError(404, 'Employee not found');
  res.json(serializeEmployee(emp));
});

const createEmployee = asyncHandler(async (req, res) => {
  const {
    email, password, full_name: fullName, employee_code: employeeCode, department_id: departmentId,
    designation, phone, address, date_of_birth: dateOfBirth, date_of_joining: dateOfJoining,
    status, salary, manager_id: managerId,
  } = req.body;

  if (!email || !password || !fullName || !employeeCode || !designation || !dateOfJoining) {
    throw new ApiError(422, 'Missing required employee fields');
  }
  if (password.length < 8) throw new ApiError(422, 'Password must be at least 8 characters');

  if (await prisma.user.findUnique({ where: { email: email.toLowerCase() } })) {
    throw new ApiError(409, 'A user with this email already exists');
  }
  if (await prisma.employee.findUnique({ where: { employeeCode } })) {
    throw new ApiError(409, 'This employee code is already in use');
  }
  if (departmentId && !(await prisma.department.findUnique({ where: { id: departmentId } }))) {
    throw new ApiError(400, 'Selected department does not exist');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const emp = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: email.toLowerCase(), password: hashedPassword, fullName, role: 'employee' },
    });
    return tx.employee.create({
      data: {
        userId: user.id, employeeCode, departmentId: departmentId || null, designation, phone, address,
        dateOfBirth: dateOfBirth || null, dateOfJoining, status: status || 'active', salary: salary ?? null,
        managerId: managerId || null,
      },
      include: INCLUDE,
    });
  });

  const portalUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  sendEmail({
    to: email.toLowerCase(),
    subject: 'Your NexOps Enterprise Platform account is ready',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to NexOps, ${fullName.split(' ')[0]}!</h2>
        <p>Your account has been created. Here are your login credentials for the Employee Portal:</p>
        <table style="border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 12px;color:#888;">Portal</td><td style="padding:6px 12px;"><a href="${portalUrl}">${portalUrl}</a></td></tr>
          <tr><td style="padding:6px 12px;color:#888;">Email</td><td style="padding:6px 12px;">${email.toLowerCase()}</td></tr>
          <tr><td style="padding:6px 12px;color:#888;">Temporary Password</td><td style="padding:6px 12px;"><strong>${password}</strong></td></tr>
        </table>
        <p style="color:#888;font-size:12px;">For security, please sign in and change your password from Profile → Change Password.</p>
      </div>
    `,
  }).catch((err) => console.error('Failed to send new-employee credentials email:', err.message));

  res.status(201).json(serializeEmployee(emp));
});

const updateEmployee = asyncHandler(async (req, res) => {
  const existing = await prisma.employee.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Employee not found');

  const {
    full_name: fullName, department_id: departmentId, designation, phone, address,
    date_of_birth: dateOfBirth, date_of_joining: dateOfJoining, status, salary, manager_id: managerId,
  } = req.body;

  if (fullName) await prisma.user.update({ where: { id: existing.userId }, data: { fullName } });

  const data = {};
  if (departmentId !== undefined) data.departmentId = departmentId || null;
  if (designation !== undefined) data.designation = designation;
  if (phone !== undefined) data.phone = phone;
  if (address !== undefined) data.address = address;
  if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth || null;
  if (dateOfJoining !== undefined) data.dateOfJoining = dateOfJoining;
  if (status !== undefined) data.status = status;
  if (salary !== undefined) data.salary = salary;
  if (managerId !== undefined) data.managerId = managerId || null;

  const emp = await prisma.employee.update({ where: { id: req.params.id }, data, include: INCLUDE });
  res.json(serializeEmployee(emp));
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const existing = await prisma.employee.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Employee not found');
  // Deleting the User cascades to the Employee row (onDelete: Cascade in schema).
  await prisma.user.delete({ where: { id: existing.userId } });
  res.json({ message: 'Employee deleted successfully' });
});

const DOC_FIELD_MAP = {
  photo: 'photoPath', resume: 'resumePath', offer_letter: 'offerLetterPath', id_proof: 'idProofPath',
};

const uploadDocument = asyncHandler(async (req, res) => {
  const { docType } = req.params;
  const field = DOC_FIELD_MAP[docType];
  if (!field) throw new ApiError(400, 'Invalid document type');
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const existing = await prisma.employee.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Employee not found');

  const emp = await prisma.employee.update({
    where: { id: req.params.id },
    data: { [field]: req.file.path.replace(/\\/g, '/') },
    include: INCLUDE,
  });
  res.json(serializeEmployee(emp));
});

module.exports = { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, uploadDocument };
