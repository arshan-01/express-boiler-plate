import { validateEnv } from "./env.schema.js";

// Validate environment variables on startup
const env = validateEnv();

/**
 * Type-safe configuration object
 * All values are validated via Zod schema
 */
export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,

  mongo: {
    uri: env.MONGODB_URI,
    dbName: env.DATABASE_NAME
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN
  },

  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    url: env.REDIS_URL
  },

  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  emailFrom: env.EMAIL_FROM,

  cors: {
    origins: env.CORS_ORIGINS
  },

  logLevel: env.LOG_LEVEL

  // Add other sections as needed (logging, stripe, etc.)
};