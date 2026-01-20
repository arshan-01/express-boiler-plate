import { Router } from "express";
import { healthRouter } from "../modules/health/health.route.js";
import { userRouter } from "../modules/user/user.route.js";
import { notifyRouter } from "../modules/notify/notify.route.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/notify", notifyRouter);

export { apiRouter };


