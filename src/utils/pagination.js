/**
 * Pagination, Sorting, and Filtering Utilities
 */

/**
 * Parse cursor pagination parameters from query
 * @param {Object} query - Express query object
 * @param {Object} options - Default values
 * @returns {Object} Cursor pagination parameters
 */
export function parsePagination(query, options = {}) {
  const limit = Math.min(
    options.maxLimit || 100,
    Math.max(1, parseInt(query.limit, 10) || options.limit || 20)
  );
  const cursor = query.cursor || null;

  return { limit, cursor };
}

function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) return null;

  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch (err) {
    throw new Error("Invalid pagination cursor");
  }
}

function createCursorPage(items, limit, getCursorPayload) {
  const hasNext = items.length > limit;
  const pageItems = hasNext ? items.slice(0, limit) : items;
  const lastItem = pageItems.at(-1);

  return {
    items: pageItems,
    hasNext,
    nextCursor: hasNext && lastItem ? encodeCursor(getCursorPayload(lastItem)) : null
  };
}

function createCursorPaginationMeta({ limit, hasNext, nextCursor }) {
  return {
    pagination: {
      limit,
      hasNext,
      nextCursor
    }
  };
}

/**
 * Parse sorting parameters from query
 * @param {Object} query - Express query object
 * @param {string[]} allowedFields - Allowed fields for sorting
 * @param {Object} options - Default values
 * @returns {Object} Sorting parameters
 */
export function parseSorting(query, allowedFields = [], options = {}) {
  const sortBy = query.sortBy || options.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  // Validate sort field
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    throw new Error(
      `Invalid sort field: ${sortBy}. Allowed fields: ${allowedFields.join(", ")}`
    );
  }

  return { sortBy, sortOrder };
}

/**
 * Parse filtering parameters from query
 * @param {Object} query - Express query object
 * @param {Object} options - Filter options
 * @returns {Object} Filtering parameters
 */
export function parseFiltering(query, options = {}) {
  const filter = {};

  // Date range filtering
  if (query.startDate) filter.startDate = new Date(query.startDate);
  if (query.endDate) filter.endDate = new Date(query.endDate);

  // Text search
  if (query.search) {
    filter.search = query.search;
    filter.searchFields = options.searchFields || [];
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
 * @param {number} limit - Items per page
 * @param {boolean} hasNext - Whether another page exists
 * @param {string|null} nextCursor - Cursor for the next page
 * @returns {Object} Pagination metadata
 */
export function createPaginationMeta({ limit, hasNext, nextCursor }) {
  return createCursorPaginationMeta({ limit, hasNext, nextCursor });
}

/**
 * Paginated response helper
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination parameters
 * @param {string} message - Response message
 * @returns {Object} Paginated response
 */
export function paginatedResponse(res, data, pagination, message = "OK") {
  const meta = createPaginationMeta(pagination);
  return res.json({
    success: true,
    message,
    data,
    meta
  });
}

export { createCursorPage, decodeCursor, encodeCursor };
