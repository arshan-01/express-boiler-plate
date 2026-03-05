import { unauthorized, forbidden } from "../utils/apiResponse.js";
import { logger } from "../config/logger.js";

/**
 * Security Authentication Middleware
 */

/**
 * API Key authentication middleware
 * @param {Function} keyValidator - Function to validate API key
 * @returns {Function} Express middleware
 */
export function apiKeyAuth(keyValidator) {
  return async (req, res, next) => {
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;

    if (!apiKey) {
      return unauthorized(res, "API key required");
    }

    try {
      const isValid = await keyValidator(apiKey);
      if (!isValid) {
        return unauthorized(res, "Invalid API key");
      }

      // Attach API key info to request
      req.apiKey = apiKey;
      next();
    } catch (err) {
      logger.error({ err }, "API key validation error");
      return unauthorized(res, "API key validation failed");
    }
  };
}

/**
 * IP whitelisting middleware
 * @param {string[]} allowedIPs - Array of allowed IP addresses or CIDR ranges
 * @returns {Function} Express middleware
 */
export function ipWhitelist(allowedIPs) {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    // Check if IP is in whitelist
    const isAllowed = allowedIPs.some((allowedIP) => {
      if (allowedIP.includes("/")) {
        // CIDR range check (simplified)
        return checkCIDR(clientIP, allowedIP);
      }
      return clientIP === allowedIP;
    });

    if (!isAllowed) {
      logger.warn({ ip: clientIP }, "IP not in whitelist");
      return forbidden(res, "IP address not allowed");
    }

    next();
  };
}

/**
 * Simple CIDR check (simplified implementation)
 */
function checkCIDR(ip, cidr) {
  const [network, prefixLength] = cidr.split("/");
  // Simplified - in production, use a proper CIDR library
  return ip.startsWith(network.split(".").slice(0, parseInt(prefixLength) / 8).join("."));
}

/**
 * CSRF protection middleware (for state-changing operations)
 * Requires CSRF token in header
 * @param {Function} tokenValidator - Function to validate CSRF token
 * @returns {Function} Express middleware
 */
export function csrfProtection(tokenValidator) {
  return async (req, res, next) => {
    // Skip GET, HEAD, OPTIONS requests
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return next();
    }

    const token = req.headers["x-csrf-token"] || req.body.csrfToken;

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "CSRF token required"
      });
    }

    try {
      const isValid = await tokenValidator(token, req);
      if (!isValid) {
        return res.status(403).json({
          success: false,
          message: "Invalid CSRF token"
        });
      }

      next();
    } catch (err) {
      logger.error({ err }, "CSRF validation error");
      return res.status(403).json({
        success: false,
        message: "CSRF validation failed"
      });
    }
  };
}
