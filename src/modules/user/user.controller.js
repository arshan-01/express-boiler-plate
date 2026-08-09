import { ok, created } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as userService from "./user.service.js";

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return created(res, user);
});

const listUsers = asyncHandler(async (req, res) => {
  const limit = req.query.limit ?? 20;
  const offset = req.query.offset ?? 0;
  const { items, total } = await userService.listUsers({ limit, offset });
  return ok(res, items, "Users fetched", { total, limit, offset });
});

export { createUser, listUsers };

