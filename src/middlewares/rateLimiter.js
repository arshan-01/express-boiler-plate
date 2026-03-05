import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

/**
 * Create a rate limiter with Redis store
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message
 * @param {boolean} options.skipSuccessfulRequests - Skip successful requests
 * @returns {Function} Express rate limiter middleware
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 100, // Limit each IP to 100 requests per windowMs
  message = "Too many requests from this IP, please try again later.",
  skipSuccessfulRequests = false,
  skipFailedRequests = false
} = {}) {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: "rl:" // Redis key prefix
    }),
    windowMs,
    max,
    message,
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
      logger.warn(
        {
          ip: req.ip,
          path: req.path,
          requestId: req.requestId || req.id
        },
        "Rate limit exceeded"
      );
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
}

/**
 * Default API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many authentication attempts, please try again later."
});

/**
 * Lenient rate limiter for public endpoints
 * 200 requests per 15 minutes per IP
 */
export const publicLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200
});
