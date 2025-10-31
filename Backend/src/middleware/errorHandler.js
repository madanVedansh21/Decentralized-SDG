const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');
const { formatError } = require('../utils/formatters');

/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = ERROR_CODES.INTERNAL_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // Default error
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode = ERROR_CODES.INTERNAL_ERROR;
  let message = 'Internal server error';

  // Handle specific error types
  if (error instanceof APIError) {
    statusCode = error.statusCode;
    errorCode = error.errorCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = Object.values(error.errors).map(e => e.message).join(', ');
  } else if (error.name === 'CastError') {
    // Mongoose cast error
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.INVALID_PARAMETERS;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    // Mongoose duplicate key error
    statusCode = HTTP_STATUS.CONFLICT;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Duplicate entry exists';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = ERROR_CODES.INVALID_SIGNATURE;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = ERROR_CODES.TOKEN_EXPIRED;
    message = 'Token expired';
  }

  // Send error response
  res.status(statusCode).json(formatError(
    { message, code: errorCode, stack: error.stack },
    errorCode
  ));
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    `Route not found: ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.VALIDATION_ERROR
  );
  next(error);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  APIError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
