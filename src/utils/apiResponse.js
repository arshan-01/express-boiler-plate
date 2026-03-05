/**
 * Standardized response helpers
 * All responses follow the format: { success: boolean, message: string, data?: any, meta?: any }
 */

function ok(res, data, message = "OK", meta) {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.json(payload);
}

function created(res, data, message = "Created", meta) {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(201).json(payload);
}

function noContent(res, message = "No Content") {
  return res.status(204).json({ success: true, message });
}

function badRequest(res, message = "Bad Request", details) {
  return res.status(400).json({
    success: false,
    message,
    ...(details && { details })
  });
}

function unauthorized(res, message = "Unauthorized") {
  return res.status(401).json({
    success: false,
    message
  });
}

function forbidden(res, message = "Forbidden") {
  return res.status(403).json({
    success: false,
    message
  });
}

function notFound(res, message = "Not Found") {
  return res.status(404).json({
    success: false,
    message
  });
}

function conflict(res, message = "Conflict", details) {
  return res.status(409).json({
    success: false,
    message,
    ...(details && { details })
  });
}

function unprocessableEntity(res, message = "Unprocessable Entity", details) {
  return res.status(422).json({
    success: false,
    message,
    ...(details && { details })
  });
}

function tooManyRequests(res, message = "Too Many Requests", retryAfter) {
  return res.status(429).json({
    success: false,
    message,
    ...(retryAfter && { retryAfter })
  });
}

function internalServerError(res, message = "Internal Server Error") {
  return res.status(500).json({
    success: false,
    message
  });
}

export {
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessableEntity,
  tooManyRequests,
  internalServerError
};


