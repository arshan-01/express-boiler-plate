import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

// Example queue
const emailQueue = new Queue("email", {
  connection: redis
});

const notificationQueue = new Queue("notification", {
  connection: redis
});

export { emailQueue, notificationQueue };


