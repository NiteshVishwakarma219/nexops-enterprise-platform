/**
 * Global error handler - normalizes every error into { detail } so the API
 * never leaks stack traces and the frontend's extractErrorMessage() keeps
 * working. Handles Prisma's error codes (P2002 unique constraint, P2025
 * not found, P2003 foreign key) instead of Mongoose's error shapes.
 */
const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  // Prisma: unique constraint violation
  if (err.code === 'P2002') {
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target;
    return res.status(409).json({ detail: `A record with this ${field || 'value'} already exists.` });
  }

  // Prisma: record not found (e.g. update/delete on a missing row)
  if (err.code === 'P2025') {
    return res.status(404).json({ detail: 'The requested record was not found.' });
  }

  // Prisma: foreign key constraint failed (e.g. referencing a deleted department)
  if (err.code === 'P2003') {
    return res.status(400).json({ detail: 'This action references a record that does not exist.' });
  }

  // Prisma: invalid input to the query engine (wrong type, malformed id, etc.)
  if (err.name === 'PrismaClientValidationError') {
    return res.status(422).json({ detail: 'Invalid request data.' });
  }

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error(err);
    return res.status(500).json({ detail: 'An unexpected error occurred. Please try again later.' });
  }

  res.status(statusCode).json({ detail: err.message || 'Something went wrong.' });
}

module.exports = { notFound, errorHandler };
