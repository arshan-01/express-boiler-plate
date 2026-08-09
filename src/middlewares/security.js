import hpp from "hpp";

/**
 * Security middleware stack
 * - hpp: Prevents HTTP Parameter Pollution
 */
export function securityMiddleware(app) {
  // Prevent HTTP Parameter Pollution
  // Prevents duplicate parameters from being processed
  app.use(
    hpp({
      whitelist: [] // Add whitelisted parameters if needed
    })
  );
}
