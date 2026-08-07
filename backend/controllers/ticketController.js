const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { notifyAdmin } = require('../utils/email');
const { serializeTicket } = require('../utils/serializers');

const INCLUDE = {
  raisedBy: { include: { user: true } },
  assignedTo: { include: { user: true } },
  comments: { include: { author: { include: { user: true } } }, orderBy: { createdAt: 'asc' } },
};

async function employeeForUser(userId) {
  const emp = await prisma.employee.findUnique({ where: { userId } });
  if (!emp) throw new ApiError(400, 'No employee profile linked to this account');
  return emp;
}

const listTickets = asyncHandler(async (req, res) => {
  const { page = 1, page_size: pageSize = 10, search, status, priority, sort_by: sortBy = 'createdAt', sort_dir: sortDir = 'desc' } = req.query;
  const where = {};
  if (req.user.role === 'employee') {
    const emp = await employeeForUser(req.user.id);
    where.raisedById = emp.id;
  }
  if (search) where.subject = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const skip = (Number(page) - 1) * Number(pageSize);
  const [docs, total] = await Promise.all([
    prisma.ticket.findMany({ where, include: INCLUDE, orderBy: { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' }, skip, take: Number(pageSize) }),
    prisma.ticket.count({ where }),
  ]);
  res.json({ items: docs.map(serializeTicket), total, page: Number(page), page_size: Number(pageSize), total_pages: Math.max(1, Math.ceil(total / Number(pageSize))) });
});

const getTicket = asyncHandler(async (req, res) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id }, include: INCLUDE });
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  res.json(serializeTicket(ticket));
});

const createTicket = asyncHandler(async (req, res) => {
  const emp = await employeeForUser(req.user.id);
  const { subject, description, category, priority } = req.body;
  if (!subject || !description) throw new ApiError(422, 'Subject and description are required');

  const ticket = await prisma.ticket.create({
    data: { subject, description, category, priority, raisedById: emp.id },
    include: INCLUDE,
  });

  notifyAdmin(
    `New ${priority || 'medium'} priority ticket: ${subject}`,
    `<p><strong>${ticket.raisedBy?.user?.fullName || 'An employee'}</strong> raised a new ticket.</p>
     <p><strong>Category:</strong> ${category || 'other'} &nbsp; <strong>Priority:</strong> ${priority || 'medium'}</p>
     <p>${description}</p>`
  );

  res.status(201).json(serializeTicket(ticket));
});

const updateTicket = asyncHandler(async (req, res) => {
  const existing = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Ticket not found');
  const { status, priority, assigned_to_id: assignedToId } = req.body;
  const data = {};
  if (status !== undefined) data.status = status;
  if (priority !== undefined) data.priority = priority;
  if (assignedToId !== undefined) data.assignedToId = assignedToId || null;

  const ticket = await prisma.ticket.update({ where: { id: req.params.id }, data, include: INCLUDE });
  res.json(serializeTicket(ticket));
});

const deleteTicket = asyncHandler(async (req, res) => {
  const existing = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Ticket not found');
  await prisma.ticket.delete({ where: { id: req.params.id } });
  res.json({ message: 'Ticket deleted successfully' });
});

const addComment = asyncHandler(async (req, res) => {
  const emp = await employeeForUser(req.user.id);
  const existing = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, 'Ticket not found');
  const { message } = req.body;
  if (!message) throw new ApiError(422, 'Comment message is required');

  await prisma.ticketComment.create({ data: { ticketId: req.params.id, authorId: emp.id, message } });
  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id }, include: INCLUDE });
  res.json(serializeTicket(ticket));
});

module.exports = { listTickets, getTicket, createTicket, updateTicket, deleteTicket, addComment };
