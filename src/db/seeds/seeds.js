import { mongoose } from "../../config/mongo.js";
import { logger } from "../../config/logger.js";

/**
 * Seed definitions
 * Add seed scripts here
 */

const seeds = [
  {
    name: "initial-users",
    run: async () => {
      const db = mongoose.connection.db;
      const usersCollection = db.collection("users");
      
      // Check if users already exist
      const existingUsers = await usersCollection.countDocuments();
      if (existingUsers > 0) {
        logger.info("Users already exist, skipping seed");
        return;
      }
      
      // Insert seed users
      await usersCollection.insertMany([
        {
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: "user@example.com",
          name: "Regular User",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      
      logger.info("Seeded initial users");
    },
    clear: async () => {
      const db = mongoose.connection.db;
      await db.collection("users").deleteMany({
        email: { $in: ["admin@example.com", "user@example.com"] }
      });
    }
  }
  // Add more seeds here
];

export default seeds;
