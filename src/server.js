import http from "node:http";

import { config } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";
import { connectMongo, disconnectMongo } from "./config/mongo.js";
import { redis } from "./config/redis.js";
import { startWorkers, stopWorkers } from "./queues/workers.js";
import { initSocket, closeSocket } from "./realtime/socket.js";

let server;

async function bootstrap() {
  await connectMongo();
  await redis.ping();
  startWorkers();

  const app = createApp();
  server = http.createServer(app);
  initSocket(server);

  server.listen(config.port, () => {
    logger.info({ port: config.port, env: config.nodeEnv }, "Server listening");
  });

  const shutdown = async (signal) => {
    logger.warn({ signal }, "Shutting down gracefully...");
    
    // Close HTTP server
    server.close(() => logger.info("HTTP server closed"));
    
    // Close Socket.io
    await closeSocket();
    
    // Stop workers gracefully
    await stopWorkers();
    
    // Close Redis connection
    try {
      await redis.quit();
    } catch (err) {
      logger.error({ err }, "Error closing Redis");
    }
    
    // Close MongoDB connection
    try {
      await disconnectMongo();
    } catch (err) {
      logger.error({ err }, "Error closing MongoDB");
    }
    
    logger.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  
  // Handle uncaught errors
  process.on("unhandledRejection", (reason, promise) => {
    logger.error({ reason, promise }, "Unhandled Rejection");
  });
  
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught Exception");
    shutdown("uncaughtException");
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});


