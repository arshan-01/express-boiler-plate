import winston from "winston";
import { config } from "./env.js";
import { getRequestContext } from "../observability/requestContext.js";

const REDACTED = "[REDACTED]";
const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "setcookie",
  "xapikey",
  "apikey",
  "accesstoken",
  "refreshtoken"
]);

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
};

const colors = {
  fatal: "red bold",
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
  trace: "gray"
};

winston.addColors(colors);

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSensitiveKey(key) {
  return SENSITIVE_KEYS.has(normalizeKey(key));
}

function serializeError(err) {
  if (!(err instanceof Error)) {
    return err;
  }

  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
    statusCode: err.statusCode
  };
}

function redact(value, seen = new WeakSet()) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Error) {
    return serializeError(value);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[Circular]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, seen));
  }

  const redacted = {};
  for (const [key, item] of Object.entries(value)) {
    redacted[key] = isSensitiveKey(key) ? REDACTED : redact(item, seen);
  }

  return redacted;
}

function normalizeLogArgs(firstArg, secondArg) {
  if (typeof firstArg === "string") {
    return {
      message: firstArg,
      meta: secondArg && typeof secondArg === "object" ? secondArg : {}
    };
  }

  if (firstArg && typeof firstArg === "object") {
    return {
      message: typeof secondArg === "string" ? secondArg : "",
      meta: firstArg
    };
  }

  return {
    message: String(firstArg ?? ""),
    meta: {}
  };
}

const devFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize({ level: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaText = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${metaText}`;
  })
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const winstonLogger = winston.createLogger({
  levels,
  level: config.logLevel,
  format: config.nodeEnv === "production" ? prodFormat : devFormat,
  transports: [new winston.transports.Console()]
});

function write(level, firstArg, secondArg) {
  const { message, meta } = normalizeLogArgs(firstArg, secondArg);
  const requestContext = getRequestContext();
  const requestMeta = requestContext?.requestId
    ? { requestId: requestContext.requestId }
    : {};

  winstonLogger.log({
    level,
    message,
    ...requestMeta,
    ...redact(meta)
  });
}

const logger = {
  fatal: (firstArg, secondArg) => write("fatal", firstArg, secondArg),
  error: (firstArg, secondArg) => write("error", firstArg, secondArg),
  warn: (firstArg, secondArg) => write("warn", firstArg, secondArg),
  info: (firstArg, secondArg) => write("info", firstArg, secondArg),
  debug: (firstArg, secondArg) => write("debug", firstArg, secondArg),
  trace: (firstArg, secondArg) => write("trace", firstArg, secondArg),
  child: () => logger
};

export { logger, redact };
