import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

/**
 * Redis Caching Utilities
 */

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
export async function getCache(key) {
  try {
    const value = await redis.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (err) {
    logger.error({ err, key }, "Cache get error");
    return null;
  }
}

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success status
 */
export async function setCache(key, value, ttl = 3600) {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (err) {
    logger.error({ err, key }, "Cache set error");
    return false;
  }
}

/**
 * Delete cached value
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCache(key) {
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    logger.error({ err, key }, "Cache delete error");
    return false;
  }
}

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Redis key pattern (e.g., "user:*")
 * @returns {Promise<number>} Number of keys deleted
 */
export async function deleteCacheByPattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      return await redis.del(...keys);
    }
    return 0;
  } catch (err) {
    logger.error({ err, pattern }, "Cache delete by pattern error");
    return 0;
  }
}

/**
 * Cache middleware for Express routes
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds
 * @param {Function} options.keyGenerator - Function to generate cache key from request
 * @param {Function} options.skipCache - Function to determine if cache should be skipped
 * @returns {Function} Express middleware
 */
export function cacheMiddleware({
  ttl = 3600,
  keyGenerator = (req) => `cache:${req.method}:${req.originalUrl}`,
  skipCache = () => false
} = {}) {
  return async (req, res, next) => {
    // Skip cache for non-GET requests or if skipCache returns true
    if (req.method !== "GET" || skipCache(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    
    try {
      const cached = await getCache(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);
      
      // Override json method to cache response
      res.json = function (data) {
        setCache(cacheKey, data, ttl).catch((err) => {
          logger.error({ err, cacheKey }, "Failed to cache response");
        });
        res.setHeader("X-Cache", "MISS");
        return originalJson(data);
      };

      next();
    } catch (err) {
      logger.error({ err, cacheKey }, "Cache middleware error");
      next();
    }
  };
}

/**
 * Invalidate cache by key pattern
 * Useful for cache invalidation strategies
 * @param {string} pattern - Redis key pattern
 */
export async function invalidateCache(pattern) {
  return await deleteCacheByPattern(pattern);
}
