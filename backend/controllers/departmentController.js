const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { serializeDepartment } = require('../utils/serializers');

const withCount = (d) => serializeDepartment(d, d._count?.employees ?? 0);

const listDepartments = asyncHandler(async (req, res) => {
  const { page = 1, page_size: pageSize = 10, search, sort_by: sortBy = 'name', sort_dir: sortDir = 'asc' } = req.query;
  const where = search
    ? { OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ] }
    : {};

  const skip = (Number(page) - 1) * Number(pageSize);
  const [docs, total] = await Promise.all([
    prisma.department.findMany({
      where, include: { _count: { select: { employees: true } } },
      orderBy: { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' }, skip, take: Number(pageSize),
    }),
    prisma.department.count({ where }),
  ]);
  res.json({
    items: docs.map(withCount), total, page: Number(page), page_size: Number(pageSize),
    total_pages: Math.max(1, Math.ceil(total / Number(pageSize))),
  });
});

const getDepartment = asyncHandler(async (req, res) => {
  const dept = await prisma.department.findUnique({
    where: { id: req.params.id }, include: { _count: { select: { employees: true } } },
  });
  if (!dept) throw new ApiError(404, 'Department not found');
  res.json(withCount(dept));
});

const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, manager_id: managerId } = req.body;
  const existing = await prisma.department.findFirst({ where: { OR: [{ name }, { code: code?.toUpperCase() }] } });
  if (existing) throw new ApiError(409, 'A department with this name or code already exists');
  const dept = await prisma.department.create({
    data: { name, code, description, managerId: managerId || null },
    include: { _count: { select: { employees: true } } },
  });
  res.status(201).json(withCount(dept));
});

const updateDepartment = asyncHandler(async (req, res) => {
  const existing = await prisma.department.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Department not found');

  const { name, code, description, manager_id: managerId } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (code !== undefined) data.code = code;
  if (description !== undefined) data.description = description;
  if (Object.prototype.hasOwnProperty.call(req.body, 'manager_id')) data.managerId = managerId || null;

  const dept = await prisma.department.update({
    where: { id: req.params.id }, data, include: { _count: { select: { employees: true } } },
  });
  res.json(withCount(dept));
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const existing = await prisma.department.findUnique({
    where: { id: req.params.id }, include: { _count: { select: { employees: true } } },
  });
  if (!existing) throw new ApiError(404, 'Department not found');
  if (existing._count.employees > 0) throw new ApiError(400, 'Cannot delete a department that still has employees assigned');
  await prisma.department.delete({ where: { id: req.params.id } });
  res.json({ message: 'Department deleted successfully' });
});

module.exports = { listDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
