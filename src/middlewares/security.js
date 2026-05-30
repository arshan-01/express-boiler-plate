import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { logger } from "../config/logger.js";

/**
 * Security middleware stack
 * - mongo-sanitize: Prevents NoSQL injection attacks
 * - hpp: Prevents HTTP Parameter Pollution
 */
export function securityMiddleware(app) {
  // Prevent NoSQL injection by sanitizing user input
  // Removes $ and . from req.body, req.query, and req.params
  app.use(
    mongoSanitize({
      replaceWith: "_",
      onSanitize: ({ req, key }) => {
        // Log sanitization in development
        if (process.env.NODE_ENV === "development") {
          logger.warn(
            { key, requestId: req.requestId || req.id },
            "Sanitized request key"
          );
        }
      }
    })
  );

  // Prevent HTTP Parameter Pollution
  // Prevents duplicate parameters from being processed
  app.use(
    hpp({
      whitelist: [] // Add whitelisted parameters if needed
    })
  );
}
