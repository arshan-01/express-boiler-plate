import { AppError } from "../../utils/appError.js";
import * as userRepository from "./user.repository.js";

async function createUser(userInput) {
  const exists = await userRepository.findUserByEmail(userInput.email);
  if (exists) {
    throw new AppError("Email already exists", 409);
  }

  const user = await userRepository.createUser(userInput);
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

async function listUsers({ limit, cursor }) {
  const { items, hasNext, nextCursor } = await userRepository.listUsers({ limit, cursor });
  return { items, hasNext, nextCursor, limit };
}

export { createUser, listUsers };
