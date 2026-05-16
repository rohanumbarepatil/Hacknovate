import logger from '../utils/logger.js';
import { error as errorResponse } from '../utils/response.js';

/**
 * Global error handling middleware
 * Catches all errors thrown in controllers/services and sends standardized response
 */
export default function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(`${err.statusCode || 500} ${req.method} ${req.originalUrl}: ${err.message}`);

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Operational errors (our custom errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json(
      errorResponse(err.message, err.code, err.details)
    );
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(
      errorResponse('File too large. Maximum size is 5MB.', 'FILE_TOO_LARGE')
    );
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json(
      errorResponse('Resource already exists', 'CONFLICT')
    );
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json(
      errorResponse('Referenced resource not found', 'FOREIGN_KEY_VIOLATION')
    );
  }

  // Default: Internal server error
  return res.status(500).json(
    errorResponse(
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      'INTERNAL_ERROR'
    )
  );
}
