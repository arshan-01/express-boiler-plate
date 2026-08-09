import { getSql } from "../../config/postgres.js";
import { logger } from "../../config/logger.js";

/**
 * Seed definitions
 * Add seed scripts here
 */

const seeds = [
  {
    name: "initial-users",
    run: async () => {
      const sql = getSql();

      // Check if users already exist
      const [existingUsers] = await sql`SELECT count(*)::int AS total FROM users`;
      if (existingUsers.total > 0) {
        logger.info("Users already exist, skipping seed");
        return;
      }

      // Insert seed users
      await sql`
        INSERT INTO users (email, name, role)
        VALUES
          ('admin@example.com', 'Admin User', 'admin'),
          ('user@example.com', 'Regular User', 'user')
        ON CONFLICT (email) DO NOTHING
      `;

      logger.info("Seeded initial users");
    },
    clear: async () => {
      const sql = getSql();
      await sql`
        DELETE FROM users
        WHERE email IN ('admin@example.com', 'user@example.com')
      `;
    }
  }
  // Add more seeds here
];

export default seeds;
