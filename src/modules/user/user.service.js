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

async function listUsers({ limit, offset }) {
  const { items, total } = await userRepository.listUsers({ limit, offset });
  return { items, total, limit, offset };
}

export { createUser, listUsers };
