const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { serializeUser } = require('../utils/serializers');

const getMyProfile = asyncHandler(async (req, res) => {
  res.json(serializeUser(req.user));
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const { full_name: fullName } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: fullName ? { fullName } : {},
  });
  res.json(serializeUser(updated));
});

const changePassword = asyncHandler(async (req, res) => {
  const { current_password: currentPassword, new_password: newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new ApiError(400, 'Current password is incorrect');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
  res.json({ message: 'Password updated successfully' });
});

const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, page_size: pageSize = 10, search } = req.query;
  const where = search
    ? { OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ] }
    : {};

  const skip = (Number(page) - 1) * Number(pageSize);
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: Number(pageSize) }),
    prisma.user.count({ where }),
  ]);
  res.json({
    items: items.map(serializeUser), total, page: Number(page), page_size: Number(pageSize),
    total_pages: Math.max(1, Math.ceil(total / Number(pageSize))),
  });
});

module.exports = { getMyProfile, updateMyProfile, changePassword, listUsers };
