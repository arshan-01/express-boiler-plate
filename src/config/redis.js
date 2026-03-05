import IORedis from "ioredis";
import { config } from "./env.js";
import { logger } from "./logger.js";

// Connection options for the singleton Redis instance
const redisOptions = {
  maxRetriesPerRequest: null, // Required for BullMQ blocking operations
  enableOfflineQueue: true, // Queue commands during reconnection
  keepAlive: 30000, // Keep connections alive
  retryStrategy: (times) => {
    // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, 1600ms, max 3000ms
    const delay = Math.min(times * 50, 3000);
    logger.warn({ times, delay }, "Redis reconnecting...");
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      // Reconnect on READONLY error (failover scenario)
      return true;
    }
    return false;
  }
};

// Determine if Redis URL is provided
const hasUrl = !!config.redis.url;

// Create single Redis instance (singleton pattern)
// Lines 34-41: Single Redis Instance Creation
const redis = hasUrl
  ? new IORedis(config.redis.url, redisOptions)
  : new IORedis({
      ...redisOptions,
      host: config.redis.host,
      port: config.redis.port,
      ...(config.redis.password && { password: config.redis.password })
    });

// Connection event handlers
redis.on("ready", () => {
  logger.info("Redis connected");
  checkConnectionHealth();
});

redis.on("connect", () => {
  logger.info("Redis connecting...");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis error");
  
  // Handle specific connection errors
  if (err.message.includes("ECONNREFUSED")) {
    logger.error("Redis connection refused - check if Redis is running");
  } else if (err.message.includes("max number of clients reached")) {
    logger.error("Redis max connection limit reached");
  }
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

redis.on("reconnecting", (delay) => {
  logger.info({ delay }, "Redis reconnecting...");
});

redis.on("end", () => {
  logger.warn("Redis connection ended");
});

// Connection monitoring and health checks
let healthCheckInterval;
let connectionCountCheckInterval;

async function checkConnectionHealth() {
  try {
    const result = await redis.ping();
    if (result === "PONG") {
      logger.debug("Redis health check: OK");
    }
  } catch (err) {
    logger.error({ err }, "Redis health check failed");
  }
}

async function monitorConnectionCount() {
  try {
    const info = await redis.info("clients");
    const connectedClients = info.match(/connected_clients:(\d+)/)?.[1];
    
    if (connectedClients) {
      const count = parseInt(connectedClients, 10);
      logger.debug({ connectedClients: count }, "Redis connection count");
      
      // Warn if connection count is high (threshold: 50)
      if (count > 50) {
        logger.warn(
          { connectedClients: count },
          "High Redis connection count detected"
        );
      }
    }
  } catch (err) {
    logger.error({ err }, "Failed to monitor Redis connection count");
  }
}

// Start periodic health checks and monitoring
function startMonitoring() {
  // Health check every 30 seconds
  healthCheckInterval = setInterval(checkConnectionHealth, 30000);
  
  // Connection count check every 60 seconds
  connectionCountCheckInterval = setInterval(monitorConnectionCount, 60000);
  
  // Initial checks
  checkConnectionHealth();
  monitorConnectionCount();
}

// Start monitoring when connection is ready
redis.once("ready", () => {
  startMonitoring();
});

// Cleanup on process exit
process.on("SIGINT", () => {
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  if (connectionCountCheckInterval) clearInterval(connectionCountCheckInterval);
});

process.on("SIGTERM", () => {
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  if (connectionCountCheckInterval) clearInterval(connectionCountCheckInterval);
});

export { redis };


