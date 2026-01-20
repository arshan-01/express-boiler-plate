import mongoose from "mongoose";
import { config } from "./env.js";
import { logger } from "./logger.js";

async function connectMongo() {
  mongoose.set("strictQuery", true);
  const uri = config.mongo.uri;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }
  
  // Connection pool settings for scalability
  const options = {
    dbName: config.mongo.dbName,
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 2, // Minimum number of connections in the pool
    serverSelectionTimeoutMS: 5000, // How long to try selecting a server
    socketTimeoutMS: 45000, // How long to wait for a socket
    connectTimeoutMS: 10000, // How long to wait for initial connection
    retryWrites: true,
    retryReads: true
  };

  await mongoose.connect(uri, options);
  logger.info({ dbName: config.mongo.dbName }, "Mongo connected");

  // Handle connection events
  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });
}

async function disconnectMongo() {
  await mongoose.disconnect();
  logger.info("Mongo disconnected");
}

export { connectMongo, disconnectMongo, mongoose };


