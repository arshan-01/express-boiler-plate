import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";
import { sendMail } from "../services/mailer.js";
import { dispatchNotification } from "../services/notification.js";

const workers = [];

function startWorkers() {
  // Example worker for email queue
  const emailWorker = new Worker(
    "email",
    async (job) => {
      logger.info({ jobId: job.id, data: job.data }, "Processing email job");
      const { to, subject, text, html } = job.data;
      if (!to || !subject) {
        throw new Error("Email job missing required fields: to, subject");
      }
      await sendMail({ to, subject, text, html });
      return { delivered: true };
    },
    {
      connection: redis,
      concurrency: 5, // Process up to 5 jobs concurrently
      limiter: {
        max: 100, // Max jobs
        duration: 1000 // Per 1 second
      }
    }
  );

  emailWorker.on("completed", (job) =>
    logger.info({ jobId: job.id }, "Email job completed")
  );
  emailWorker.on("failed", (job, err) =>
    logger.error({ jobId: job?.id, err }, "Email job failed")
  );

  workers.push(emailWorker);

  // Notifications worker
  const notificationWorker = new Worker(
    "notification",
    async (job) => {
      logger.info({ jobId: job.id, data: job.data }, "Processing notification job");
      const { userId, channel = "notification", payload } = job.data || {};
      if (!userId || !payload) {
        throw new Error("Notification job missing required fields: userId, payload");
      }
      await dispatchNotification({ userId, channel, payload });
      return { delivered: true };
    },
    {
      connection: redis,
      concurrency: 10, // Process up to 10 jobs concurrently
      limiter: {
        max: 200, // Max jobs
        duration: 1000 // Per 1 second
      }
    }
  );

  notificationWorker.on("completed", (job) =>
    logger.info({ jobId: job.id }, "Notification job completed")
  );
  notificationWorker.on("failed", (job, err) =>
    logger.error({ jobId: job?.id, err }, "Notification job failed")
  );

  workers.push(notificationWorker);

  logger.info({ workerCount: workers.length }, "Workers started");
}

async function stopWorkers() {
  await Promise.all(workers.map((worker) => worker.close()));
  logger.info("All workers stopped");
}

export { startWorkers, stopWorkers };


