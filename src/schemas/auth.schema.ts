import { z } from "zod";
import {
  emailValidation,
  passwordValidation,
  usernameValidation,
  fullNameValidation,
} from "../constants/auth.constants.js";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .regex(emailValidation.value, emailValidation.message),

  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .regex(fullNameValidation.value, fullNameValidation.message),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(usernameValidation.value, usernameValidation.message),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(passwordValidation.value, passwordValidation.message),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
