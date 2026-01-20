import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { enqueueEmail, enqueueNotification } from "./notify.controller.js";
import { emailJobSchema, notificationJobSchema } from "./notify.schema.js";

const notifyRouter = Router();

notifyRouter.post("/email", validate(emailJobSchema), enqueueEmail);
notifyRouter.post("/push", validate(notificationJobSchema), enqueueNotification);

export { notifyRouter };


