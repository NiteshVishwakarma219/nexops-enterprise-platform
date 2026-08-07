const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const headcountByDepartment = asyncHandler(async (req, res) => {
  const departments = await prisma.department.findMany({ include: { _count: { select: { employees: true } } } });
  res.json(departments.map((d) => ({ label: d.name, value: d._count.employees })));
});

const employeeStatusBreakdown = asyncHandler(async (req, res) => {
  const rows = await prisma.employee.groupBy({ by: ['status'], _count: { status: true } });
  res.json(rows.map((r) => ({ label: r.status, value: r._count.status })));
});

const leaveTypeBreakdown = asyncHandler(async (req, res) => {
  const rows = await prisma.leaveRequest.groupBy({ by: ['leaveType'], where: { status: 'approved' }, _count: { leaveType: true } });
  res.json(rows.map((r) => ({ label: r.leaveType, value: r._count.leaveType })));
});

const assetCategoryBreakdown = asyncHandler(async (req, res) => {
  const rows = await prisma.asset.groupBy({ by: ['category'], _count: { category: true } });
  res.json(rows.map((r) => ({ label: r.category, value: r._count.category })));
});

const attendanceStatusBreakdown = asyncHandler(async (req, res) => {
  const rows = await prisma.attendance.groupBy({ by: ['status'], _count: { status: true } });
  res.json(rows.map((r) => ({ label: r.status, value: r._count.status })));
});

module.exports = { headcountByDepartment, employeeStatusBreakdown, leaveTypeBreakdown, assetCategoryBreakdown, attendanceStatusBreakdown };
