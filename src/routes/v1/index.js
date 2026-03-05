import { Router } from "express";
import { healthRouter } from "../../modules/health/health.route.js";
import { userRouter } from "../../modules/user/user.route.js";
import { notifyRouter } from "../../modules/notify/notify.route.js";
import { metricsRouter } from "../../modules/metrics/metrics.route.js";
import { debugRouter } from "../../modules/debug/debug.route.js";

const v1Router = Router();

// Mount v1 routes
v1Router.use("/health", healthRouter);
v1Router.use("/users", userRouter);
v1Router.use("/notify", notifyRouter);
v1Router.use("/metrics", metricsRouter);
v1Router.use("/debug", debugRouter);

export { v1Router };
