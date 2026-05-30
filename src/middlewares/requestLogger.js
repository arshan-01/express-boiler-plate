import { isSensitiveKey, logger } from "../config/logger.js";

const URL_BASE = "http://localhost";

function getResponseTimeMs(startedAt) {
  const diff = process.hrtime.bigint() - startedAt;
  return Number(diff) / 1_000_000;
}

function sanitizeUrl(rawUrl) {
  if (!rawUrl) {
    return rawUrl;
  }

  try {
    const url = new URL(rawUrl, URL_BASE);
    for (const key of [...url.searchParams.keys()]) {
      if (isSensitiveKey(key)) {
        url.searchParams.set(key, "[REDACTED]");
      }
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return rawUrl;
  }
}

function buildRequestLog(req, res, startedAt) {
  const url = req.originalUrl || req.url;

  return {
    method: req.method,
    url: sanitizeUrl(url),
    statusCode: res.statusCode,
    requestId: req.id || req.requestId,
    responseTimeMs: Number(getResponseTimeMs(startedAt).toFixed(2)),
    userId: req.auth?.userId || null,
    authType: req.auth?.type || null,
    apiKeyId: req.auth?.apiKey?.id || null,
    ip: req.ip || req.socket?.remoteAddress || null,
    userAgent: req.get("user-agent") || null
  };
}

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  let completed = false;

  res.on("finish", () => {
    completed = true;
    logger.info(buildRequestLog(req, res, startedAt), "request completed");
  });

  res.on("close", () => {
    if (completed) {
      return;
    }

    logger.info(buildRequestLog(req, res, startedAt), "request aborted");
  });

  next();
}
