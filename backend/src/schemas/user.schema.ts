import { z } from "zod";

// An email arrives as text, so we do it in two stages:
//   stage 1: clean the text (remove spaces, make it lowercase)
//   stage 2: check that the cleaned text looks like an email
// `.pipe(...)` is what hands the output of stage 1 to stage 2.
// The order matters: if we checked the format first, "  bob@example.com " would fail.
const emailField = z
  .string("Email must be text")
  .trim()
  .toLowerCase()
  .pipe(z.email("Email is not valid"));

// What a client must send in the body to register.
// These rules mirror user.model.ts: username 1-30 characters, password 6-50.
export const registerSchema = z.object({
  username: z
    .string("Username must be text")
    .trim()
    .toLowerCase()
    .min(1, "Username cannot be empty")
    .max(30, "Username cannot be more than 30 characters"),

  email: emailField,

  password: z
    .string("Password must be text")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password cannot be more than 50 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// What a client must send in the body to log in.
// The password rules are deliberately lighter than for registering:
// here we only need to know a password was sent. Whether it is CORRECT is
// decided later by comparing it with the stored hash.
export const loginSchema = z.object({
  email: emailField,

  password: z
    .string("Password must be text")
    .min(1, "Password cannot be empty"),
});

export type LoginInput = z.infer<typeof loginSchema>;
