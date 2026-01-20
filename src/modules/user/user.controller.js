import { ok, created } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";
import { User } from "./user.model.js";

const createUser = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) {
    throw new AppError("Email already exists", 409);
  }

  const user = await User.create(req.body);
  return created(res, { id: user.id, email: user.email, name: user.name, role: user.role });
});

const listUsers = asyncHandler(async (req, res) => {
  const limit = req.query.limit ?? 20;
  const offset = req.query.offset ?? 0;

  const [items, total] = await Promise.all([
    User.find().skip(offset).limit(limit).lean(),
    User.countDocuments()
  ]);

  return ok(res, items, "Users fetched", { total, limit, offset });
});

export { createUser, listUsers };


