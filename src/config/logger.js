import pino from "pino";
import { config } from "./env.js";
import { getRequestContext } from "../observability/requestContext.js";

const logger = pino({
  level: config.logLevel,
  mixin() {
    const requestContext = getRequestContext();
    if (!requestContext?.requestId) {
      return {};
    }
    return { requestId: requestContext.requestId };
  },
  transport:
    config.nodeEnv === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" }
        }
      : undefined
});

export { logger };


