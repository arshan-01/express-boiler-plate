import { created } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { emailQueue, notificationQueue } from "../../queues/queues.js";

const enqueueEmail = asyncHandler(async (req, res) => {
  const job = await emailQueue.add("send", req.body);
  return created(res, { jobId: job.id }, "Email enqueued");
});

const enqueueNotification = asyncHandler(async (req, res) => {
  const job = await notificationQueue.add("dispatch", req.body);
  return created(res, { jobId: job.id }, "Notification enqueued");
});

export { enqueueEmail, enqueueNotification };


