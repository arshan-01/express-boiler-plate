import { User } from "./user.model.js";
import { createCursorPage, decodeCursor } from "../../utils/pagination.js";

async function findUserByEmail(email) {
  return User.findOne({ email }).lean();
}

async function createUser(userInput) {
  return User.create(userInput);
}

async function listUsers({ limit, cursor }) {
  const cursorData = decodeCursor(cursor);
  const filter = cursorData
    ? {
        $or: [
          { createdAt: { $lt: new Date(cursorData.createdAt) } },
          { createdAt: new Date(cursorData.createdAt), _id: { $lt: cursorData.id } }
        ]
      }
    : {};

  const items = await User.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean();

  return createCursorPage(items, limit, (item) => ({
    createdAt: item.createdAt,
    id: item._id
  }));
}

export { createUser, findUserByEmail, listUsers };
