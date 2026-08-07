/**
 * Authentication & RBAC middleware.
 * - protect: validates the JWT and attaches req.user (the User row)
 * - authorize(...roles): restricts a route to specific roles
 */
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Could not validate credentials');
  }
  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Could not validate credentials');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new ApiError(401, 'Could not validate credentials');
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};

module.exports = { protect, authorize };
