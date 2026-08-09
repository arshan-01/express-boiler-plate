import { getSql } from "../../config/postgres.js";
import { createCursorPage, decodeCursor } from "../../utils/pagination.js";
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

async function listUsers({ limit, cursor }) {
  const sql = getSql();
  const cursorData = decodeCursor(cursor);
  const rows = cursorData
    ? await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE (created_at, id) < (${cursorData.createdAt}::timestamptz, ${cursorData.id}::uuid)
      ORDER BY created_at DESC
      LIMIT ${limit + 1}
    `
    : await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ${limit + 1}
    `;

  const page = createCursorPage(rows, limit, (row) => ({
    createdAt: row.created_at,
    id: row.id
  }));

  return {
    ...page,
    items: page.items.map(mapUserRow)
  };
}

export { createUser, findUserByEmail, listUsers };
