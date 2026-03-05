import { Router } from "express";
import { mongoose } from "../../config/mongo.js";
import { redis } from "../../config/redis.js";
import { ok } from "../../utils/apiResponse.js";

const healthRouter = Router();

/**
 * Health check endpoint
 * Checks database and Redis connections
 */
healthRouter.get("/", async (req, res) => {
  const health = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: {
      database: "unknown",
      redis: "unknown"
    }
  };

  // Check MongoDB connection
  try {
    const mongoState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    health.services.database =
      mongoState === 1 ? "connected" : mongoState === 2 ? "connecting" : "disconnected";
  } catch (err) {
    health.services.database = "error";
  }

  // Check Redis connection
  try {
    await redis.ping();
    health.services.redis = "connected";
  } catch (err) {
    health.services.redis = "disconnected";
  }

  // Determine overall health
  const allHealthy =
    health.services.database === "connected" && health.services.redis === "connected";

  if (!allHealthy) {
    health.status = "degraded";
  }

  return ok(res, health, allHealthy ? "healthy" : "degraded");
});

export { healthRouter };


