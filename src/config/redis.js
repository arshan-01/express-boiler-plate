import IORedis from "ioredis";
import { config } from "./env.js";
import { logger } from "./logger.js";

const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null, // Required for BullMQ blocking operations
  ...(config.redis.password && { password: config.redis.password }),
  ...(config.redis.url && { url: config.redis.url })
};

const redis = new IORedis(redisConfig);

redis.on("ready", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error({ err }, "Redis error"));

export { redis };


