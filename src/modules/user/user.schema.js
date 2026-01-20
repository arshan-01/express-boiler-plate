import { z } from "zod";

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1),
    role: z.enum(["user", "admin"]).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const listUsersSchema = z.object({
  body: z.object({}).optional(),
  query: z
    .object({
      limit: z.coerce.number().int().positive().max(100).default(20),
      offset: z.coerce.number().int().nonnegative().default(0)
    })
    .partial(),
  params: z.object({}).optional()
});

export { createUserSchema, listUsersSchema };


