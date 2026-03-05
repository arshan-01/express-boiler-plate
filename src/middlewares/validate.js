import { z } from "zod";

/**
 * Validate request data (body, query, params)
 * @param {z.ZodSchema} schema - Zod schema
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Validate only query parameters
 * @param {z.ZodSchema} schema - Zod schema for query
 * @returns {Function} Express middleware
 */
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Validate only request body
 * @param {z.ZodSchema} schema - Zod schema for body
 * @returns {Function} Express middleware
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Validate only route parameters
 * @param {z.ZodSchema} schema - Zod schema for params
 * @returns {Function} Express middleware
 */
function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Common query parameter schemas
 */
export const querySchemas = {
  pagination: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20))
  }),
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
  }),
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }),
  search: z.object({
    search: z.string().optional()
  })
};

export { validate, validateQuery, validateBody, validateParams };


