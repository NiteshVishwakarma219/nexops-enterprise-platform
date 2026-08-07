const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { serializeAsset } = require('../utils/serializers');

const INCLUDE = { assignedTo: { include: { user: true } } };

const listAssets = asyncHandler(async (req, res) => {
  const { page = 1, page_size: pageSize = 10, search, category, status, sort_by: sortBy = 'name', sort_dir: sortDir = 'asc' } = req.query;
  const where = {};
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { assetTag: { contains: search, mode: 'insensitive' } },
  ];
  if (category) where.category = category;
  if (status) where.status = status;

  const skip = (Number(page) - 1) * Number(pageSize);
  const [docs, total] = await Promise.all([
    prisma.asset.findMany({ where, include: INCLUDE, orderBy: { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' }, skip, take: Number(pageSize) }),
    prisma.asset.count({ where }),
  ]);
  res.json({ items: docs.map(serializeAsset), total, page: Number(page), page_size: Number(pageSize), total_pages: Math.max(1, Math.ceil(total / Number(pageSize))) });
});

const getAsset = asyncHandler(async (req, res) => {
  const asset = await prisma.asset.findUnique({ where: { id: req.params.id }, include: INCLUDE });
  if (!asset) throw new ApiError(404, 'Asset not found');
  res.json(serializeAsset(asset));
});

const createAsset = asyncHandler(async (req, res) => {
  const { asset_tag: assetTag, name, category, status, purchase_date: purchaseDate, purchase_cost: purchaseCost, warranty_expiry: warrantyExpiry, assigned_to_id: assignedToId, notes } = req.body;
  if (!assetTag || !name) throw new ApiError(422, 'Asset tag and name are required');
  if (await prisma.asset.findUnique({ where: { assetTag } })) throw new ApiError(409, 'An asset with this tag already exists');

  const asset = await prisma.asset.create({
    data: { assetTag, name, category, status, purchaseDate: purchaseDate || null, purchaseCost: purchaseCost ?? null, warrantyExpiry: warrantyExpiry || null, assignedToId: assignedToId || null, notes },
    include: INCLUDE,
  });
  res.status(201).json(serializeAsset(asset));
});

const updateAsset = asyncHandler(async (req, res) => {
  const existing = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Asset not found');

  const map = { name: 'name', category: 'category', status: 'status', purchase_date: 'purchaseDate', purchase_cost: 'purchaseCost', warranty_expiry: 'warrantyExpiry', assigned_to_id: 'assignedToId', notes: 'notes' };
  const data = {};
  for (const [bodyKey, field] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      data[field] = req.body[bodyKey] === '' ? null : req.body[bodyKey];
    }
  }
  const asset = await prisma.asset.update({ where: { id: req.params.id }, data, include: INCLUDE });
  res.json(serializeAsset(asset));
});

const deleteAsset = asyncHandler(async (req, res) => {
  const existing = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Asset not found');
  await prisma.asset.delete({ where: { id: req.params.id } });
  res.json({ message: 'Asset deleted successfully' });
});

module.exports = { listAssets, getAsset, createAsset, updateAsset, deleteAsset };
