import { z } from "zod";

const emailJobSchema = z.object({
  body: z.object({
    to: z.string().email(),
    subject: z.string().min(1),
    text: z.string().optional(),
    html: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const notificationJobSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    channel: z.string().optional(),
    payload: z.record(z.any())
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export { emailJobSchema, notificationJobSchema };


