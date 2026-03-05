import { mongoose } from "../../config/mongo.js";
import { logger } from "../../config/logger.js";

/**
 * Database Migration System
 * Simple migration system for MongoDB
 */

const migrationsCollection = "migrations";

/**
 * Get applied migrations
 */
async function getAppliedMigrations() {
  const db = mongoose.connection.db;
  const collection = db.collection(migrationsCollection);
  const migrations = await collection.find({}).toArray();
  return migrations.map((m) => m.name);
}

/**
 * Mark migration as applied
 */
async function markMigrationApplied(name) {
  const db = mongoose.connection.db;
  const collection = db.collection(migrationsCollection);
  await collection.insertOne({
    name,
    appliedAt: new Date()
  });
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
