import { ok, created } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createPaginationMeta, parsePagination } from "../../utils/pagination.js";
import * as userService from "./user.service.js";

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return created(res, user);
});

const listUsers = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { items, hasNext, nextCursor, limit } = await userService.listUsers(pagination);
  return ok(res, items, "Users fetched", createPaginationMeta({ limit, hasNext, nextCursor }));
});

export { createUser, listUsers };
