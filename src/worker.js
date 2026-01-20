import { config } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectMongo, disconnectMongo } from "./config/mongo.js";
import { redis } from "./config/redis.js";
import { startWorkers, stopWorkers } from "./queues/workers.js";

/**
 * Standalone worker process
 * Run workers separately from the HTTP server for better scalability
 * Usage: node --env-file=.env src/worker.js
 */
async function bootstrap() {
  await connectMongo();
  await redis.ping();
  startWorkers();

  logger.info("Worker process started");

  const shutdown = async (signal) => {
    logger.warn({ signal }, "Shutting down workers...");
    await stopWorkers();
    try {
      await redis.quit();
    } catch (err) {
      logger.error({ err }, "Error closing Redis");
    }
    try {
      await disconnectMongo();
    } catch (err) {
      logger.error({ err }, "Error closing MongoDB");
    }
    logger.info("Worker shutdown complete");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("unhandledRejection", (reason, promise) => {
    logger.error({ reason, promise }, "Unhandled Rejection");
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Failed to start worker");
  process.exit(1);
});

