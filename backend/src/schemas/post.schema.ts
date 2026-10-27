import { z } from "zod";

// This describes what a client must send in the body to create a post.
// It mirrors the rules in post.model.ts, but it runs BEFORE we reach the database.
export const createPostSchema = z.object({
  name: z
    .string("Name must be text")
    .trim()
    .min(1, "Name cannot be empty"),

  description: z
    .string("Description must be text")
    .trim()
    .min(1, "Description cannot be empty"),

  age: z
    .number("Age must be a number")
    .min(1, "Age must be at least 1")
    .max(150, "Age cannot be more than 150"),
});

// Zod can work out the TypeScript type from the schema above,
// so we never have to write the same shape twice.
// This is equivalent to:  { name: string; description: string; age: number }
export type CreatePostInput = z.infer<typeof createPostSchema>;

// This describes what a client may send in the body to update a post.
// An update can change just one thing, so every field is optional.
// But if a field IS sent, it must follow the same rules as when creating.
export const updatePostSchema = z.object({
  name: z
    .string("Name must be text")
    .trim()
    .min(1, "Name cannot be empty")
    .optional(),

  description: z
    .string("Description must be text")
    .trim()
    .min(1, "Description cannot be empty")
    .optional(),

  age: z
    .number("Age must be a number")
    .min(1, "Age must be at least 1")
    .max(150, "Age cannot be more than 150")
    .optional(),
});

// Same idea as before: the type comes from the schema.
// This is equivalent to:  { name?: string; description?: string; age?: number }
// The question mark means "this field may be missing".
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
