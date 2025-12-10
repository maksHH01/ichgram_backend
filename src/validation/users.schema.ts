import { z } from "zod";

import {
  emailValidation,
  passwordValidation,
} from "../constants/users.constants";

export const passwordSchema = z
  .string()
  .trim()
  .min(6, "Password must be at least 6 characters")
  .regex(passwordValidation.value, passwordValidation.message);

export type PasswordSchema = z.infer<typeof passwordSchema>;

export const emailSchema = z
  .string()
  .trim()
  .regex(emailValidation.value, emailValidation.message);

export type EmailSchema = z.infer<typeof emailSchema>;

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers and underscores",
  );

export const resetPasswordSchema = z.object({
  verificationCode: z.string().min(1, "Verification code is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const userAddSchema = z.object({
  fullname: z.string().trim().min(1, "Fullname is required"),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type UserAddSchema = z.infer<typeof userAddSchema>;

export const verifyCodeSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
});

export const changePasswordSchema = z.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
