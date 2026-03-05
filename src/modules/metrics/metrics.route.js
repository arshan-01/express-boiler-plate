import { Router } from "express";
import { metrics } from "../../utils/metrics.js";

const metricsRouter = Router();

/**
 * Prometheus metrics endpoint
 */
metricsRouter.get("/prometheus", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(metrics.getPrometheusFormat());
});

/**
 * JSON metrics endpoint
 */
metricsRouter.get("/json", (req, res) => {
  res.json({
    success: true,
    data: metrics.getJSON()
  });
});

export { metricsRouter };
