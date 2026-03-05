import { Router } from "express";
import { versionNegotiation, validateVersion } from "../middlewares/apiVersioning.js";
import { v1Router } from "./v1/index.js";

const apiRouter = Router();

// API versioning middleware
apiRouter.use(versionNegotiation);
apiRouter.use(validateVersion([1])); // Currently support v1

// Versioned routes
apiRouter.use("/v1", v1Router);

// Default to v1 for backward compatibility
apiRouter.use("/", v1Router);

export { apiRouter };


