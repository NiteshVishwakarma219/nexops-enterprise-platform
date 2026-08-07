const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { serializeAttendance } = require('../utils/serializers');

const INCLUDE = { employee: { include: { user: true } } };

const listAttendance = asyncHandler(async (req, res) => {
  const { page = 1, page_size: pageSize = 10, employee_id: employeeId, date_from: dateFrom, date_to: dateTo, sort_by: sortBy = 'date', sort_dir: sortDir = 'desc' } = req.query;
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }
  const skip = (Number(page) - 1) * Number(pageSize);
  const [docs, total] = await Promise.all([
    prisma.attendance.findMany({ where, include: INCLUDE, orderBy: { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' }, skip, take: Number(pageSize) }),
    prisma.attendance.count({ where }),
  ]);
  res.json({ items: docs.map(serializeAttendance), total, page: Number(page), page_size: Number(pageSize), total_pages: Math.max(1, Math.ceil(total / Number(pageSize))) });
});

const markAttendance = asyncHandler(async (req, res) => {
  const { employee_id: employeeId, date, check_in: checkIn, check_out: checkOut, status } = req.body;
  if (!employeeId || !date) throw new ApiError(422, 'Employee and date are required');
  if (!(await prisma.employee.findUnique({ where: { id: employeeId } }))) throw new ApiError(400, 'Employee does not exist');
  if (await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId, date: new Date(date) } } })) {
    throw new ApiError(409, 'Attendance for this employee and date already recorded');
  }
  const record = await prisma.attendance.create({
    data: { employeeId, date: new Date(date), checkIn: checkIn || null, checkOut: checkOut || null, status: status || 'present' },
    include: INCLUDE,
  });
  res.status(201).json(serializeAttendance(record));
});

const updateAttendance = asyncHandler(async (req, res) => {
  const existing = await prisma.attendance.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Attendance record not found');
  const { check_in: checkIn, check_out: checkOut, status } = req.body;
  const data = {};
  if (checkIn !== undefined) data.checkIn = checkIn || null;
  if (checkOut !== undefined) data.checkOut = checkOut || null;
  if (status !== undefined) data.status = status;
  const record = await prisma.attendance.update({ where: { id: req.params.id }, data, include: INCLUDE });
  res.json(serializeAttendance(record));
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const existing = await prisma.attendance.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Attendance record not found');
  await prisma.attendance.delete({ where: { id: req.params.id } });
  res.json({ message: 'Attendance record deleted' });
});

module.exports = { listAttendance, markAttendance, updateAttendance, deleteAttendance };
