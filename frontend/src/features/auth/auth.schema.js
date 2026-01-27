// libs imports
import { z } from "zod";

// Request payload for register
export const RegisterRequestSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can contain only letters, numbers, and underscores",
    ),

  email: z.string().min(1, "Email is required").email("Enter a valid email"),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Request payload for login
const emailSchema = z.string().email("Enter a valid email");

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can contain only letters, numbers, and underscores",
  );

export const LoginRequestSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (value) =>
        emailSchema.safeParse(value).success ||
        usernameSchema.safeParse(value).success,
      {
        message: "Enter a valid email or username",
      },
    ),

  password: z.string().min(8, "Password must be at least 8 characters"),
});
