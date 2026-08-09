import { User } from "./user.model.js";

async function findUserByEmail(email) {
  return User.findOne({ email }).lean();
}

async function createUser(userInput) {
  return User.create(userInput);
}

async function listUsers({ limit, offset }) {
  const [items, total] = await Promise.all([
    User.find().skip(offset).limit(limit).lean(),
    User.countDocuments()
  ]);

  return { items, total };
}

export { createUser, findUserByEmail, listUsers };
