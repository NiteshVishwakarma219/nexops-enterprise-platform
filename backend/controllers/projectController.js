const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { serializeProject } = require('../utils/serializers');

const INCLUDE = {
  lead: { include: { user: true } },
  department: true,
  members: { include: { employee: { include: { user: true } } } },
};

const listProjects = asyncHandler(async (req, res) => {
  const { page = 1, page_size: pageSize = 10, search, status, sort_by: sortBy = 'createdAt', sort_dir: sortDir = 'desc' } = req.query;
  const where = {};
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;

  const skip = (Number(page) - 1) * Number(pageSize);
  const [docs, total] = await Promise.all([
    prisma.project.findMany({ where, include: INCLUDE, orderBy: { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' }, skip, take: Number(pageSize) }),
    prisma.project.count({ where }),
  ]);
  res.json({ items: docs.map(serializeProject), total, page: Number(page), page_size: Number(pageSize), total_pages: Math.max(1, Math.ceil(total / Number(pageSize))) });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: INCLUDE });
  if (!project) throw new ApiError(404, 'Project not found');
  res.json(serializeProject(project));
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, start_date: startDate, end_date: endDate, department, lead_id: leadId, members = [] } = req.body;
  if (!name) throw new ApiError(422, 'Project name is required');

  const project = await prisma.project.create({
    data: {
      name, description, status, startDate: startDate || null, endDate: endDate || null,
      departmentId: department || null, leadId: leadId || null,
      members: { create: members.map((m) => ({ employeeId: m.employee_id, roleInProject: m.role_in_project || null })) },
    },
    include: INCLUDE,
  });
  res.status(201).json(serializeProject(project));
});

const updateProject = asyncHandler(async (req, res) => {
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Project not found');

  const map = { name: 'name', description: 'description', status: 'status', start_date: 'startDate', end_date: 'endDate', department_id: 'departmentId', lead_id: 'leadId' };
  const data = {};
  for (const [bodyKey, field] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      data[field] = req.body[bodyKey] === '' ? null : req.body[bodyKey];
    }
  }
  const project = await prisma.project.update({ where: { id: req.params.id }, data, include: INCLUDE });
  res.json(serializeProject(project));
});

const deleteProject = asyncHandler(async (req, res) => {
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Project not found');
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted successfully' });
});

const addMember = asyncHandler(async (req, res) => {
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Project not found');
  const { employee_id: employeeId, role_in_project: roleInProject } = req.body;

  const already = await prisma.projectMember.findUnique({ where: { projectId_employeeId: { projectId: req.params.id, employeeId } } });
  if (already) throw new ApiError(409, 'Employee is already a member of this project');

  await prisma.projectMember.create({ data: { projectId: req.params.id, employeeId, roleInProject: roleInProject || null } });
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: INCLUDE });
  res.json(serializeProject(project));
});

const removeMember = asyncHandler(async (req, res) => {
  const result = await prisma.projectMember.deleteMany({ where: { projectId: req.params.id, employeeId: req.params.employeeId } });
  if (result.count === 0) throw new ApiError(404, 'Membership not found');
  res.json({ message: 'Member removed from project' });
});

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };
