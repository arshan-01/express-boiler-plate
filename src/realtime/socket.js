import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { config } from "../config/env.js";
import { logger } from "../config/logger.js";
import { redis } from "../config/redis.js";

let io;
let pubClient;

function initSocket(server) {
  // Create and store the duplicate Redis client for the adapter
  pubClient = redis.duplicate();
  
  io = new Server(server, {
    cors: {
      origin: config.cors.origins,
      credentials: true
    },
    // Enable scaling across multiple instances
    adapter: createAdapter(redis, pubClient)
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(String(userId));
      logger.info({ userId }, "Socket connected and joined user room");
    }

    socket.on("disconnect", (reason) => {
      logger.info({ userId, reason }, "Socket disconnected");
    });
  });

  logger.info("Socket.io initialized with Redis adapter");
  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

async function closeSocket() {
  if (io) {
    io.close();
    logger.info("Socket.io closed");
  }
  if (pubClient) {
    await pubClient.quit();
    logger.info("Redis pub client closed");
  }
}

export { initSocket, getIO, closeSocket };


