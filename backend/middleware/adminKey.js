/**
 * Guards admin-only maintenance endpoints (e.g. remote seeding) with a
 * shared secret passed via the `x-admin-key` header, since these routes
 * run before any user account necessarily exists to authenticate with.
 */
const ApiError = require('../utils/ApiError');

function requireAdminKey(req, res, next) {
  const provided = req.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY) {
    throw new ApiError(500, 'ADMIN_KEY is not configured on the server');
  }
  if (!provided || provided !== process.env.ADMIN_KEY) {
    throw new ApiError(401, 'Invalid or missing admin key');
  }
  next();
}

module.exports = requireAdminKey;
