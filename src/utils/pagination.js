/**
 * Pagination, Sorting, and Filtering Utilities
 */

/**
 * Parse pagination parameters from query
 * @param {Object} query - Express query object
 * @param {Object} options - Default values
 * @returns {Object} Pagination parameters
 */
export function parsePagination(query, options = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || options.page || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit, 10) || options.limit || 20)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Parse sorting parameters from query
 * @param {Object} query - Express query object
 * @param {string[]} allowedFields - Allowed fields for sorting
 * @param {Object} options - Default values
 * @returns {Object} Sort object for MongoDB
 */
export function parseSorting(query, allowedFields = [], options = {}) {
  const sortBy = query.sortBy || options.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  // Validate sort field
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    throw new Error(
      `Invalid sort field: ${sortBy}. Allowed fields: ${allowedFields.join(", ")}`
    );
  }

  return { [sortBy]: sortOrder };
}

/**
 * Parse filtering parameters from query
 * @param {Object} query - Express query object
 * @param {Object} options - Filter options
 * @returns {Object} Filter object for MongoDB
 */
export function parseFiltering(query, options = {}) {
  const filter = {};

  // Date range filtering
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  // Text search
  if (query.search) {
    filter.$or = options.searchFields?.map((field) => ({
      [field]: { $regex: query.search, $options: "i" }
    })) || [];
  }

  // Custom filters from options
  if (options.customFilters) {
    Object.entries(options.customFilters).forEach(([key, value]) => {
      if (query[key] !== undefined) {
        filter[key] = value(query[key]);
      }
    });
  }

  return filter;
}

/**
 * Create pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export function createPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Paginated response helper
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} total - Total number of items
 * @param {Object} pagination - Pagination parameters
 * @param {string} message - Response message
 * @returns {Object} Paginated response
 */
export function paginatedResponse(res, data, total, pagination, message = "OK") {
  const meta = createPaginationMeta(total, pagination.page, pagination.limit);
  return res.json({
    success: true,
    message,
    data,
    meta
  });
}
