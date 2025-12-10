import { z } from "zod";

import { passwordSchema, emailSchema, usernameSchema } from "./users.schema";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Identifier is required")
    .refine(
      (value) => {
        return (
          emailSchema.safeParse(value).success ||
          usernameSchema.safeParse(value).success
        );
      },
      { message: "Must be a valid email or username" },
    ),
  password: passwordSchema,
});

export type Login = z.infer<typeof loginSchema>;
