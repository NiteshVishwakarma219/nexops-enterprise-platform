const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { serializeNotification } = require('../utils/serializers');

const listNotifications = asyncHandler(async (req, res) => {
  const { page = 1, page_size: pageSize = 10, unread_only: unreadOnly } = req.query;
  const where = { userId: req.user.id };
  if (unreadOnly === 'true') where.isRead = false;

  const skip = (Number(page) - 1) * Number(pageSize);
  const [docs, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: Number(pageSize) }),
    prisma.notification.count({ where }),
  ]);
  res.json({ items: docs.map(serializeNotification), total, page: Number(page), page_size: Number(pageSize), total_pages: Math.max(1, Math.ceil(total / Number(pageSize))) });
});

const markAsRead = asyncHandler(async (req, res) => {
  const n = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!n) throw new ApiError(404, 'Notification not found');
  await prisma.notification.update({ where: { id: n.id }, data: { isRead: true } });
  res.json({ message: 'Notification marked as read' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
  res.json({ message: 'All notifications marked as read' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const n = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!n) throw new ApiError(404, 'Notification not found');
  await prisma.notification.delete({ where: { id: n.id } });
  res.json({ message: 'Notification deleted' });
});

module.exports = { listNotifications, markAsRead, markAllRead, deleteNotification };
