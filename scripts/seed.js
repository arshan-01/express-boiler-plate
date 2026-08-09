#!/usr/bin/env node

/**
 * Database Seeding Script
 * Run: node scripts/seed.js
 */

import { connectPostgres, disconnectPostgres } from "../src/config/postgres.js";
import { runSeeds } from "../src/db/seeds/index.js";
import { logger } from "../src/config/logger.js";

async function main() {
  try {
    await connectPostgres();
    await runSeeds();
    logger.info("Seeding completed successfully");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Seeding failed");
    process.exit(1);
  } finally {
    await disconnectPostgres();
  }
}

main();
