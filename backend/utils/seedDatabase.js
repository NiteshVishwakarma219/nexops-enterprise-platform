/**
 * Core seed logic, shared by:
 *  - seed.js (CLI: `npm run seed`)
 *  - the ADMIN_KEY-protected POST /api/admin/seed route (for hosted
 *    databases where you can't easily open a shell to run the CLI script).
 *
 * Each demo role gets its own distinct password (not a shared default) —
 * the demo accounts use fictitious @nexops.com addresses that can't
 * receive real email, so the "credentials emailed automatically" behavior
 * lives in employeeController.createEmployee for real accounts instead.
 */
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

const DEMO_PASSWORDS = {
  admin: 'Admin@NexOps2026',
  hr: 'HrPortal@2026',
  manager: 'Manager@2026',
  employee: 'Employee@2026',
};

async function seedDatabase({ force = false } = {}) {
  const existingCount = await prisma.user.count();
  if (existingCount > 0 && !force) {
    return { seeded: false, message: 'Database already has data. Skipping seed.' };
  }

  if (force && existingCount > 0) {
    // Order matters: children before parents, respecting foreign keys.
    await prisma.ticketComment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.passwordResetOtp.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();
  }

  const engineering = await prisma.department.create({ data: { name: 'Engineering', code: 'ENG', description: 'Product engineering and platform team' } });
  const hrDept = await prisma.department.create({ data: { name: 'Human Resources', code: 'HR', description: 'People operations' } });
  const sales = await prisma.department.create({ data: { name: 'Sales', code: 'SALES', description: 'Revenue and customer growth' } });

  const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

  async function makeUserEmployee(email, fullName, role, deptId, designation, code, salary) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(DEMO_PASSWORDS[role], salt);
    const user = await prisma.user.create({ data: { email, password: hashed, fullName, role } });
    const emp = await prisma.employee.create({
      data: {
        userId: user.id, employeeCode: code, departmentId: deptId, designation,
        phone: '+1-555-0100', dateOfJoining: daysAgo(400), status: 'active', salary,
      },
    });
    return { user, emp };
  }

  const { emp: hrEmp } = await makeUserEmployee('hr@nexops.com', 'Jamie Chen', 'hr', hrDept.id, 'HR Manager', 'EMP-0002', 95000);
  const { emp: mgrEmp } = await makeUserEmployee('manager@nexops.com', 'Taylor Reed', 'manager', engineering.id, 'Engineering Manager', 'EMP-0003', 130000);
  const { emp: empEmp } = await makeUserEmployee('employee@nexops.com', 'Jordan Lee', 'employee', engineering.id, 'Software Engineer', 'EMP-0004', 105000);
  const { emp: emp2Emp } = await makeUserEmployee('sam.rivera@nexops.com', 'Sam Rivera', 'employee', sales.id, 'Account Executive', 'EMP-0005', 88000);
  await makeUserEmployee('admin@nexops.com', 'Alex Morgan', 'admin', engineering.id, 'Platform Administrator', 'EMP-0001', 145000);

  await prisma.department.update({ where: { id: engineering.id }, data: { managerId: mgrEmp.id } });
  await prisma.employee.update({ where: { id: empEmp.id }, data: { managerId: mgrEmp.id } });

  await prisma.asset.createMany({
    data: [
      { assetTag: 'AST-1001', name: 'MacBook Pro 16"', category: 'laptop', status: 'assigned', assignedToId: empEmp.id, purchaseCost: 2499 },
      { assetTag: 'AST-1002', name: 'Dell UltraSharp Monitor', category: 'monitor', status: 'assigned', assignedToId: empEmp.id, purchaseCost: 450 },
      { assetTag: 'AST-1003', name: 'iPhone 15', category: 'mobile', status: 'available', purchaseCost: 999 },
      { assetTag: 'AST-1004', name: 'Figma Enterprise License', category: 'software_license', status: 'assigned', assignedToId: mgrEmp.id, purchaseCost: 45 },
    ],
  });

  await prisma.leaveRequest.createMany({
    data: [
      { employeeId: empEmp.id, leaveType: 'annual', startDate: daysFromNow(5), endDate: daysFromNow(9), reason: 'Family vacation', status: 'pending' },
      { employeeId: emp2Emp.id, leaveType: 'sick', startDate: daysAgo(2), endDate: daysAgo(1), reason: 'Flu', status: 'approved', reviewedById: hrEmp.id },
    ],
  });

  await prisma.ticket.createMany({
    data: [
      { subject: 'Laptop running slow', description: 'My laptop has been very slow since the last update.', category: 'it', priority: 'medium', status: 'open', raisedById: empEmp.id },
      { subject: 'Payroll discrepancy', description: 'My last paycheck seems incorrect.', category: 'finance', priority: 'high', status: 'in_progress', raisedById: emp2Emp.id, assignedToId: hrEmp.id },
    ],
  });

  return {
    seeded: true,
    message: 'Seed complete.',
    accounts: [
      { role: 'admin', email: 'admin@nexops.com', password: DEMO_PASSWORDS.admin },
      { role: 'hr', email: 'hr@nexops.com', password: DEMO_PASSWORDS.hr },
      { role: 'manager', email: 'manager@nexops.com', password: DEMO_PASSWORDS.manager },
      { role: 'employee', email: 'employee@nexops.com', password: DEMO_PASSWORDS.employee },
    ],
  };
}

module.exports = seedDatabase;
