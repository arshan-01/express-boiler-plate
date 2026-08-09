import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { config } from "./config/env.js";
import { requestId } from "./middlewares/requestId.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { securityMiddleware } from "./middlewares/security.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

function createApp() {
  const app = express();

  // Trust proxy (for rate limiting and IP detection behind reverse proxy)
  app.set("trust proxy", 1);

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true
    })
  );

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Compression (compress responses > 1KB)
  app.use(
    compression({
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
          return false;
        }
        return compression.filter(req, res);
      }
    })
  );

  // Request ID middleware (must be before request logging)
  app.use(requestId);
  app.use(requestLogger);

  // Security middleware (mongo-sanitize, HPP)
  securityMiddleware(app);

  // Health check endpoint (no rate limiting)
  app.get("/", (req, res) => res.json({ ok: true, service: "backend-template" }));

  // Versioned routes with rate limiting
  app.use(apiLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { createApp };
