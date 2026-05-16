/**
 * Standardized API response helpers
 * Ensures consistent JSON format across all endpoints
 */

/**
 * Success response
 */
export function success(data, message = 'Success', meta = null) {
  const response = {
    success: true,
    data,
    message,
  };
  if (meta) response.meta = meta;
  return response;
}

/**
 * Paginated success response
 */
export function paginated(data, page, limit, total) {
  return {
    success: true,
    data,
    message: 'Success',
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Error response
 */
export function error(message, code = 'INTERNAL_ERROR', details = null) {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) response.error.details = details;
  return response;
}
