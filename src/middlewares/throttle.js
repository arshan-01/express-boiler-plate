import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

/**
 * API Throttling & Quotas
 * Per-user rate limits and feature-based quotas
 */

/**
 * Per-user rate limiter
 * Limits requests per user ID (from req.user.id or req.userId)
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
export function perUserLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  userIdExtractor = (req) => req.user?.id || req.userId || req.ip
} = {}) {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: "throttle:user:"
    }),
    windowMs,
    max,
    keyGenerator: (req) => {
      const userId = userIdExtractor(req);
      return String(userId);
    },
    message: "Too many requests for this user, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
  });
}

/**
 * Feature-based quota limiter
 * Limits usage of specific features (e.g., API calls, file uploads)
 * @param {string} feature - Feature name
 * @param {Object} options - Quota options
 * @returns {Function} Express middleware
 */
export function featureQuotaLimiter(
  feature,
  { windowMs = 60 * 60 * 1000, max = 1000, userIdExtractor = (req) => req.user?.id || req.userId }
) {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `quota:${feature}:`
    }),
    windowMs,
    max,
    keyGenerator: (req) => {
      const userId = userIdExtractor(req);
      return String(userId || req.ip);
    },
    message: `Quota exceeded for feature: ${feature}`,
    standardHeaders: true,
    legacyHeaders: false
  });
}

/**
 * Usage tracking middleware
 * Tracks API usage per user/feature
 * @param {string} feature - Feature name to track
 * @param {Function} userIdExtractor - Function to extract user ID
 * @returns {Function} Express middleware
 */
export function usageTracker(feature, userIdExtractor = (req) => req.user?.id || req.userId) {
  return async (req, res, next) => {
    const userId = userIdExtractor(req);
    if (!userId) {
      return next();
    }

    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const usageKey = `usage:${feature}:${userId}:${date}`;

    try {
      // Increment usage counter
      await redis.incr(usageKey);
      await redis.expire(usageKey, 86400); // Expire after 24 hours

      // Get current usage
      const usage = await redis.get(usageKey);
      
      // Add usage info to response headers
      res.setHeader("X-Usage-Count", usage || 0);
      res.setHeader("X-Usage-Feature", feature);
    } catch (err) {
      logger.error({ err, feature, userId }, "Usage tracking error");
      // Don't block request on tracking error
    }

    next();
  };
}

/**
 * Get usage statistics for a user
 * @param {string} userId - User ID
 * @param {string} feature - Feature name
 * @param {number} days - Number of days to retrieve
 * @returns {Promise<Object>} Usage statistics
 */
export async function getUsageStats(userId, feature, days = 7) {
  const stats = {};
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const key = `usage:${feature}:${userId}:${dateStr}`;
    
    try {
      const count = await redis.get(key);
      stats[dateStr] = parseInt(count || 0, 10);
    } catch (err) {
      logger.error({ err, key }, "Error getting usage stats");
      stats[dateStr] = 0;
    }
  }

  return stats;
}
