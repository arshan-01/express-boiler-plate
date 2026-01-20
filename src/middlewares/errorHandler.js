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

  logger.error(
    { err, statusCode, path: req.originalUrl, method: req.method },
    "Request error"
  );

  return res.status(statusCode).json({
    success: false,
    message,
    details: isProd ? undefined : details
  });
}

export { errorHandler };


