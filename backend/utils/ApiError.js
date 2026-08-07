/**
 * Standard application error carrying an HTTP status code.
 * Caught by the global error handler and returned as { detail: message },
 * matching the shape the frontend already expects.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
