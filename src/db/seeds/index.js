import { mongoose } from "../../config/mongo.js";
import { logger } from "../../config/logger.js";

/**
 * Database Seeding System
 * Seed initial data into the database
 */

/**
 * Run seed scripts
 */
export async function runSeeds() {
  try {
    logger.info("Running database seeds");
    
    // Import and run seed functions
    const seeds = await import("./seeds.js").then((m) => m.default);
    
    for (const seed of seeds) {
      logger.info({ seed: seed.name }, "Running seed");
      await seed.run();
      logger.info({ seed: seed.name }, "Seed completed");
    }
    
    logger.info("All seeds completed");
  } catch (err) {
    logger.error({ err }, "Seed failed");
    throw err;
  }
}

/**
 * Clear all seed data (use with caution)
 */
export async function clearSeeds() {
  try {
    logger.warn("Clearing seed data");
    const seeds = await import("./seeds.js").then((m) => m.default);
    
    for (const seed of seeds) {
      if (seed.clear) {
        logger.info({ seed: seed.name }, "Clearing seed data");
        await seed.clear();
      }
    }
    
    logger.info("Seed data cleared");
  } catch (err) {
    logger.error({ err }, "Clear seeds failed");
    throw err;
  }
}
