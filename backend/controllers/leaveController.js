const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { notifyAdmin } = require('../utils/email');
const { serializeLeave } = require('../utils/serializers');

const INCLUDE = { employee: { include: { user: true } } };

async function employeeForUser(userId) {
  const emp = await prisma.employee.findUnique({ where: { userId } });
  if (!emp) throw new ApiError(400, 'No employee profile linked to this account');
  return emp;
}

const listLeaves = asyncHandler(async (req, res) => {
  const { page = 1, page_size: pageSize = 10, status, sort_by: sortBy = 'createdAt', sort_dir: sortDir = 'desc' } = req.query;
  let { employee_id: employeeId } = req.query;

  if (req.user.role === 'employee') {
    const emp = await employeeForUser(req.user.id);
    employeeId = emp.id;
  }

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;

  const skip = (Number(page) - 1) * Number(pageSize);
  const [docs, total] = await Promise.all([
    prisma.leaveRequest.findMany({ where, include: INCLUDE, orderBy: { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' }, skip, take: Number(pageSize) }),
    prisma.leaveRequest.count({ where }),
  ]);
  res.json({ items: docs.map(serializeLeave), total, page: Number(page), page_size: Number(pageSize), total_pages: Math.max(1, Math.ceil(total / Number(pageSize))) });
});

const applyLeave = asyncHandler(async (req, res) => {
  const emp = await employeeForUser(req.user.id);
  const { leave_type: leaveType, start_date: startDate, end_date: endDate, reason } = req.body;
  if (!leaveType || !startDate || !endDate || !reason) throw new ApiError(422, 'All leave fields are required');
  if (new Date(endDate) < new Date(startDate)) throw new ApiError(422, 'end_date must be on or after start_date');

  const lr = await prisma.leaveRequest.create({
    data: { employeeId: emp.id, leaveType, startDate: new Date(startDate), endDate: new Date(endDate), reason },
    include: INCLUDE,
  });

  notifyAdmin(
    `New leave request: ${lr.employee?.user?.fullName || 'An employee'}`,
    `<p><strong>${lr.employee?.user?.fullName || 'An employee'}</strong> requested ${leaveType} leave from ${startDate} to ${endDate}.</p>
     <p><strong>Reason:</strong> ${reason}</p>`
  );

  res.status(201).json(serializeLeave(lr));
});

const reviewLeave = asyncHandler(async (req, res) => {
  const reviewer = await employeeForUser(req.user.id);
  const existing = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Leave request not found');
  if (existing.status !== 'pending') throw new ApiError(400, 'Only pending leave requests can be reviewed');

  const { status, review_comment: reviewComment } = req.body;
  const lr = await prisma.leaveRequest.update({
    where: { id: req.params.id },
    data: { status, reviewComment: reviewComment || null, reviewedById: reviewer.id },
    include: INCLUDE,
  });
  res.json(serializeLeave(lr));
});

const cancelLeave = asyncHandler(async (req, res) => {
  const emp = await employeeForUser(req.user.id);
  const existing = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Leave request not found');
  if (existing.employeeId !== emp.id) throw new ApiError(403, 'You can only cancel your own leave requests');
  if (existing.status !== 'pending') throw new ApiError(400, 'Only pending requests can be cancelled');

  const lr = await prisma.leaveRequest.update({ where: { id: req.params.id }, data: { status: 'cancelled' }, include: INCLUDE });
  res.json(serializeLeave(lr));
});

module.exports = { listLeaves, applyLeave, reviewLeave, cancelLeave };
