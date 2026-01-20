import { Router } from "express";
import { createUser, listUsers } from "./user.controller.js";
import { validate } from "../../middlewares/validate.js";
import { createUserSchema, listUsersSchema } from "./user.schema.js";

const userRouter = Router();

userRouter.get("/", validate(listUsersSchema), listUsers);
userRouter.post("/", validate(createUserSchema), createUser);

export { userRouter };


