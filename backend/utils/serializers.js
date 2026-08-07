/**
 * Shapes Prisma rows into the exact JSON contract the frontend expects
 * (snake_case field names, *_id / *_name pairs for relations). With Prisma,
 * the foreign-key scalar (e.g. departmentId) is always present, and the
 * related object (e.g. department) is only present when explicitly
 * `include`d — so, unlike the old Mongoose version, there's no ambiguity
 * to detect here.
 */

const serializeUser = (u) => ({
  id: u.id,
  email: u.email,
  full_name: u.fullName,
  role: u.role,
  is_active: u.isActive,
  avatar_url: u.avatarUrl,
  created_at: u.createdAt,
});

const serializeDepartment = (d, employeeCount = 0) => ({
  id: d.id,
  name: d.name,
  code: d.code,
  description: d.description,
  manager_id: d.managerId,
  employee_count: employeeCount,
  created_at: d.createdAt,
  updated_at: d.updatedAt,
});

const serializeEmployee = (e) => ({
  id: e.id,
  employee_code: e.employeeCode,
  full_name: e.user?.fullName,
  email: e.user?.email,
  department_id: e.departmentId,
  department_name: e.department?.name || null,
  designation: e.designation,
  phone: e.phone,
  address: e.address,
  date_of_birth: e.dateOfBirth,
  date_of_joining: e.dateOfJoining,
  status: e.status,
  salary: e.salary,
  manager_id: e.managerId,
  manager_name: e.manager?.user?.fullName || null,
  photo_path: e.photoPath,
  resume_path: e.resumePath,
  offer_letter_path: e.offerLetterPath,
  id_proof_path: e.idProofPath,
  created_at: e.createdAt,
  updated_at: e.updatedAt,
});

const serializeAsset = (a) => ({
  id: a.id,
  asset_tag: a.assetTag,
  name: a.name,
  category: a.category,
  status: a.status,
  purchase_date: a.purchaseDate,
  purchase_cost: a.purchaseCost,
  warranty_expiry: a.warrantyExpiry,
  assigned_to_id: a.assignedToId,
  assigned_to_name: a.assignedTo?.user?.fullName || null,
  notes: a.notes,
  created_at: a.createdAt,
  updated_at: a.updatedAt,
});

const serializeAttendance = (rec) => ({
  id: rec.id,
  employee_id: rec.employeeId,
  employee_name: rec.employee?.user?.fullName || null,
  date: rec.date,
  check_in: rec.checkIn,
  check_out: rec.checkOut,
  status: rec.status,
  created_at: rec.createdAt,
});

const serializeLeave = (l) => ({
  id: l.id,
  employee_id: l.employeeId,
  employee_name: l.employee?.user?.fullName || null,
  leave_type: l.leaveType,
  start_date: l.startDate,
  end_date: l.endDate,
  reason: l.reason,
  status: l.status,
  reviewed_by_id: l.reviewedById,
  review_comment: l.reviewComment,
  created_at: l.createdAt,
});

const serializeProject = (p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  status: p.status,
  start_date: p.startDate,
  end_date: p.endDate,
  department_id: p.departmentId,
  lead_id: p.leadId,
  lead_name: p.lead?.user?.fullName || null,
  members: (p.members || []).map((m) => ({
    employee_id: m.employeeId,
    employee_name: m.employee?.user?.fullName || null,
    role_in_project: m.roleInProject,
  })),
  created_at: p.createdAt,
});

const serializeTicket = (t) => ({
  id: t.id,
  subject: t.subject,
  description: t.description,
  category: t.category,
  priority: t.priority,
  status: t.status,
  raised_by_id: t.raisedById,
  raised_by_name: t.raisedBy?.user?.fullName || null,
  assigned_to_id: t.assignedToId,
  assigned_to_name: t.assignedTo?.user?.fullName || null,
  comments: (t.comments || []).map((c) => ({
    id: c.id,
    author_id: c.authorId,
    author_name: c.author?.user?.fullName || null,
    message: c.message,
    created_at: c.createdAt,
  })),
  created_at: t.createdAt,
  updated_at: t.updatedAt,
});

const serializeNotification = (n) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  type: n.type,
  is_read: n.isRead,
  link: n.link,
  created_at: n.createdAt,
});

module.exports = {
  serializeUser, serializeDepartment, serializeEmployee, serializeAsset,
  serializeAttendance, serializeLeave, serializeProject, serializeTicket, serializeNotification,
};
