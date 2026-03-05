#!/usr/bin/env node

/**
 * Database Migration Script
 * Run: node scripts/migrate.js
 */

import { connectMongo, disconnectMongo } from "../src/config/mongo.js";
import { runMigrations } from "../src/db/migrations/index.js";
import { logger } from "../src/config/logger.js";

async function main() {
  try {
    await connectMongo();
    await runMigrations();
    logger.info("Migrations completed successfully");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Migrations failed");
    process.exit(1);
  } finally {
    await disconnectMongo();
  }
}

main();
