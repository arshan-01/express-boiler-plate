import { getSql } from "../../config/postgres.js";
import { logger } from "../../config/logger.js";

/**
 * Database Migration System
 * Simple migration system for Postgres
 */

async function ensureMigrationsTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id bigserial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

/**
 * Get applied migrations
 */
async function getAppliedMigrations() {
  const sql = getSql();
  await ensureMigrationsTable();
  const migrations = await sql`SELECT name FROM migrations ORDER BY applied_at ASC`;
  return migrations.map((m) => m.name);
}

/**
 * Mark migration as applied
 */
async function markMigrationApplied(name) {
  const sql = getSql();
  await sql`
    INSERT INTO migrations (name)
    VALUES (${name})
    ON CONFLICT (name) DO NOTHING
  `;
}

/**
 * Run a migration
 */
async function runMigration(name, up) {
  try {
    logger.info({ migration: name }, "Running migration");
    await up();
    await markMigrationApplied(name);
    logger.info({ migration: name }, "Migration completed");
  } catch (err) {
    logger.error({ err, migration: name }, "Migration failed");
    throw err;
  }
}

/**
 * Run all pending migrations
 */
export async function runMigrations() {
  const applied = await getAppliedMigrations();
  const allMigrations = await import("./migrations.js").then((m) => m.default);

  for (const migration of allMigrations) {
    if (!applied.includes(migration.name)) {
      await runMigration(migration.name, migration.up);
    } else {
      logger.debug({ migration: migration.name }, "Migration already applied");
    }
  }
}
