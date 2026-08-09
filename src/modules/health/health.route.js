import { Router } from "express";
import { pingPostgres } from "../../config/postgres.js";
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

  // Check Postgres connection
  try {
    await pingPostgres();
    health.services.database = "connected";
  } catch (err) {
    health.services.database = "error";
  }

  // Check Redis connection + memory usage
  try {
    await redis.ping();
    health.services.redis = "connected";

    const info = await redis.info("memory");
    const stats = {};
    for (const line of info.split("\r\n")) {
      if (!line || line.startsWith("#")) continue;
      const [k, v] = line.split(":");
      if (
        k === "used_memory_human" ||
        k === "used_memory_peak_human" ||
        k === "used_memory_rss_human" ||
        k === "maxmemory_human" ||
        k === "mem_fragmentation_ratio"
      ) {
        stats[k] = v;
      }
    }
    health.redis = stats;
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

