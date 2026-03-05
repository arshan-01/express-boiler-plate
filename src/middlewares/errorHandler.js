import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { config } from "../config/env.js";
import { logger } from "../config/logger.js";

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  void next;

  const isProd = config.nodeEnv === "production";

  // Default
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message =
    err.message || getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR);
  let details = err.details;

  // Zod validation
  if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation error";
    details = err.flatten();
  }

  // Mongoose validation & cast
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Database validation error";
    details = Object.values(err.errors).map((e) => e.message);
  }
  if (err instanceof mongoose.Error.CastError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Invalid id";
    details = { path: err.path, value: err.value };
  }

  // Duplicate key
  if (err && err.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    message = "Duplicate key";
    details = err.keyValue;
  }

  // Error logging with context
  const requestId = req.requestId || req.id;
  const logPayload = {
    err,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    requestId
  };

  // 4xx errors are often expected (unauthenticated user, validation errors, etc).
  // Log them as warn/info to avoid noisy "error" logs in development.
  if (statusCode >= 500) {
    logger.error(logPayload, "Request error");
  } else if (statusCode === 401 && req.originalUrl?.includes("/api/auth/me")) {
    logger.info(logPayload, "Request unauthorized");
  } else {
    logger.warn(logPayload, "Request rejected");
  }

  return res.status(statusCode).json({
    success: false,
    message,
    details: isProd ? undefined : details
  });
}

export { errorHandler };


