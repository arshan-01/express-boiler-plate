import { Router } from "express";
import { ok } from "../../utils/apiResponse.js";
import { config } from "../../config/env.js";
import { redis } from "../../config/redis.js";
import { getSql } from "../../config/postgres.js";

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

  debugRouter.get("/postgres", async (req, res) => {
    try {
      const sql = getSql();
      const [version] = await sql`SELECT version()`;
      const tables = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      ok(res, {
        version: version.version,
        tables: tables.map((table) => table.table_name)
      }, "Postgres info");
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to get Postgres info",
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
