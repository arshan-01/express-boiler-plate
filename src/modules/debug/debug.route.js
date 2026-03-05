import { Router } from "express";
import { ok } from "../../utils/apiResponse.js";
import { config } from "../../config/env.js";
import { redis } from "../../config/redis.js";
import { mongoose } from "../../config/mongo.js";

const debugRouter = Router();

/**
 * Development-only debug endpoints
 * Only available in development mode
 */
if (config.nodeEnv === "development") {
  debugRouter.get("/info", (req, res) => {
    ok(res, {
      nodeEnv: config.nodeEnv,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      pid: process.pid
    }, "Debug info");
  });

  debugRouter.get("/redis", async (req, res) => {
    try {
      const info = await redis.info();
      ok(res, { info }, "Redis info");
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to get Redis info",
        error: err.message
      });
    }
  });

  debugRouter.get("/mongo", async (req, res) => {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      ok(res, {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        collections: collections.map((c) => c.name)
      }, "MongoDB info");
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to get MongoDB info",
        error: err.message
      });
    }
  });
} else {
  // In production, return 404
  debugRouter.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Not found"
    });
  });
}

export { debugRouter };
