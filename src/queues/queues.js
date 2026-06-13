import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

const defaultJobOptions = {
  removeOnComplete: 1000,
  removeOnFail: 5000,
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 }
};

const emailQueue = new Queue("email", {
  connection: redis,
  defaultJobOptions
});

const notificationQueue = new Queue("notification", {
  connection: redis,
  defaultJobOptions
});

export { emailQueue, notificationQueue };


