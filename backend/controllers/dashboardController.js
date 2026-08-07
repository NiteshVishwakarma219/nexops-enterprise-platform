const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

const getStats = asyncHandler(async (req, res) => {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [
    totalEmployees, activeEmployees, totalDepartments,
    presentToday, absentToday, onLeaveToday,
    totalAssets, assignedAssets, pendingLeaveRequests, openTickets,
    totalProjects, activeProjects,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: 'active' } }),
    prisma.department.count(),
    prisma.attendance.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: 'present' } }),
    prisma.attendance.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: 'absent' } }),
    prisma.leaveRequest.count({ where: { status: 'approved', startDate: { lte: todayEnd }, endDate: { gte: todayStart } } }),
    prisma.asset.count(),
    prisma.asset.count({ where: { status: 'assigned' } }),
    prisma.leaveRequest.count({ where: { status: 'pending' } }),
    prisma.ticket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: 'in_progress' } }),
  ]);

  res.json({
    total_employees: totalEmployees, total_departments: totalDepartments, active_employees: activeEmployees,
    on_leave_today: onLeaveToday, present_today: presentToday, absent_today: absentToday,
    total_assets: totalAssets, assigned_assets: assignedAssets, pending_leave_requests: pendingLeaveRequests,
    open_tickets: openTickets, total_projects: totalProjects, active_projects: activeProjects,
  });
});

const getDepartmentDistribution = asyncHandler(async (req, res) => {
  const departments = await prisma.department.findMany({ include: { _count: { select: { employees: true } } } });
  res.json(departments.map((d) => ({ label: d.name, value: d._count.employees })));
});

const getAttendanceTrend = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 7;
  // Group by calendar day using a raw query, since Prisma's groupBy can't
  // truncate a DateTime to a date on its own.
  const rows = await prisma.$queryRaw`
    SELECT TO_CHAR("date", 'YYYY-MM-DD') AS label, COUNT(*)::int AS value
    FROM "Attendance"
    WHERE status = 'present'
    GROUP BY label
    ORDER BY label DESC
    LIMIT ${days}
  `;
  res.json(rows.reverse());
});

const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const [leaves, tickets] = await Promise.all([
    prisma.leaveRequest.findMany({ include: { employee: { include: { user: true } } }, orderBy: { createdAt: 'desc' }, take: limit }),
    prisma.ticket.findMany({ include: { raisedBy: { include: { user: true } } }, orderBy: { createdAt: 'desc' }, take: limit }),
  ]);

  const activities = [
    ...leaves.map((l) => ({
      id: l.id, type: 'leave',
      description: `${l.employee?.user?.fullName || 'Someone'} requested ${l.leaveType} leave`,
      timestamp: l.createdAt.toISOString(),
    })),
    ...tickets.map((t) => ({
      id: t.id, type: 'ticket',
      description: `${t.raisedBy?.user?.fullName || 'Someone'} raised a ticket: ${t.subject}`,
      timestamp: t.createdAt.toISOString(),
    })),
  ];
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(activities.slice(0, limit));
});

module.exports = { getStats, getDepartmentDistribution, getAttendanceTrend, getRecentActivities };
