import { neon } from "@neondatabase/serverless";
import { config } from "./env.js";
import { logger } from "./logger.js";

let sql;

function getSql() {
  if (!sql) {
    if (!config.postgres.url) {
      throw new Error("DATABASE_URL is not configured");
    }
    sql = neon(config.postgres.url);
  }

  return sql;
}

async function connectPostgres() {
  const db = getSql();
  await db`SELECT 1`;
  logger.info("Postgres connected");
}

async function disconnectPostgres() {
  // Neon serverless uses stateless HTTP requests, so there is no long-lived pool to close.
  logger.debug("Postgres disconnect skipped");
}

async function pingPostgres() {
  await getSql()`SELECT 1`;
}

export { connectPostgres, disconnectPostgres, getSql, pingPostgres };
