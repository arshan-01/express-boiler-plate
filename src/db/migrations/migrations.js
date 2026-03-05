import { mongoose } from "../../config/mongo.js";
import { logger } from "../../config/logger.js";

/**
 * Migration definitions
 * Add new migrations here
 */

const migrations = [
  {
    name: "001-initial-schema",
    up: async () => {
      // Example: Create indexes
      const db = mongoose.connection.db;
      
      // Create indexes for users collection
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
      await db.collection("users").createIndex({ createdAt: -1 });
      
      logger.info("Applied migration: 001-initial-schema");
    }
  }
  // Add more migrations here
];

export default migrations;
