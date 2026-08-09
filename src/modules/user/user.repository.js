import { getSql } from "../../config/postgres.js";
import { mapUserRow } from "./user.model.js";

async function findUserByEmail(email) {
  const sql = getSql();
  const [user] = await sql`
    SELECT id, email, name, role, created_at, updated_at
    FROM users
    WHERE email = lower(${email})
    LIMIT 1
  `;
  return mapUserRow(user);
}

async function createUser(userInput) {
  const sql = getSql();
  const [user] = await sql`
    INSERT INTO users (email, name, role)
    VALUES (lower(${userInput.email}), ${userInput.name}, ${userInput.role || "user"})
    RETURNING id, email, name, role, created_at, updated_at
  `;
  return mapUserRow(user);
}

async function listUsers({ limit, offset }) {
  const sql = getSql();
  const [items, total] = await Promise.all([
    sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`SELECT count(*)::int AS total FROM users`
  ]);

  return { items: items.map(mapUserRow), total: total[0].total };
}

export { createUser, findUserByEmail, listUsers };
