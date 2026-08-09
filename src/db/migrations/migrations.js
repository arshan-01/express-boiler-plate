import { getSql } from "../../config/postgres.js";
import { logger } from "../../config/logger.js";

/**
 * Migration definitions
 * Add new migrations here
 */

const migrations = [
  {
    name: "001-initial-schema",
    up: async () => {
      const sql = getSql();

      await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email text NOT NULL UNIQUE,
          name text NOT NULL,
          role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC)`;

      logger.info("Applied migration: 001-initial-schema");
    }
  }
  // Add more migrations here
];

export default migrations;
