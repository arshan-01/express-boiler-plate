import { z } from "zod";

/**
 * Zod schema for environment variable validation
 * Validates all required environment variables on startup
 */
export const envSchema = z.object({
  // Server
  PORT: z
    .string()
    .optional()
    .default("8000")
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),

  // MongoDB
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  DATABASE_NAME: z.string().optional().default("express-boilerplate"),

  // JWT
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().optional().default("7d"),

  // Redis
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z
    .string()
    .optional()
    .default("6379")
    .transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(), // Redis connection URL (optional, can be redis:// or rediss://)

  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // App
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .optional()
    .default("info"),
  CORS_ORIGINS: z
    .string()
    .optional()
    .default("http://localhost:3000,http://localhost:3001")
    .transform((val) =>
      val.split(",").map((origin) => origin.trim()).filter(Boolean)
    )
});

/**
 * Validates environment variables and returns typed config
 * Throws error if validation fails
 */
export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(
        `Environment validation failed:\n${missingVars}\n\nPlease check your .env file.`
      );
    }
    throw error;
  }
}
