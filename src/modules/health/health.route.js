import { Router } from "express";
import { ok } from "../../utils/apiResponse.js";

const healthRouter = Router();

healthRouter.get("/", (req, res) =>
  ok(res, { uptime: process.uptime(), timestamp: Date.now() }, "healthy")
);

export { healthRouter };


