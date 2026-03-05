import { randomUUID } from "node:crypto";
import { runWithRequestContext } from "../observability/requestContext.js";

/**
 * Add unique request ID to each request for tracking
 * Accepts X-Request-ID header or generates a UUID
 * Uses AsyncLocalStorage to track request context
 */
export const requestId = (req, res, next) => {
  const incomingRequestId = req.headers["x-request-id"];
  const id = Array.isArray(incomingRequestId)
    ? incomingRequestId[0]
    : incomingRequestId || randomUUID();
  
  req.id = id;
  req.requestId = id;
  res.setHeader("X-Request-ID", id);
  
  runWithRequestContext({ requestId: id }, next);
};
