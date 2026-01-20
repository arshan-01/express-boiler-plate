import { getIO } from "../realtime/socket.js";
import { logger } from "../config/logger.js";

async function dispatchNotification({ userId, channel = "notification", payload }) {
  const io = getIO();
  // Rooms are keyed by userId; clients join their user room on connect
  io.to(String(userId)).emit(channel, payload);
  logger.info({ userId, channel }, "Notification dispatched");
}

export { dispatchNotification };


