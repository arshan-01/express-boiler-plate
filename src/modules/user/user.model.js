const USER_TABLE = "users";
const USER_ROLES = ["user", "admin"];

function mapUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export { USER_ROLES, USER_TABLE, mapUserRow };

