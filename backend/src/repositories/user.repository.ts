import { User } from "../models/user.model.js";
import type { RegisterInput } from "../schemas/user.schema.js";

// The user repository is the ONLY file that talks to the User model.
// It does database work and nothing else:
//   - no business rules (no "email already taken" checks)
//   - no AppError, no status codes
//   - no req or res
// When something is not found, it returns null and lets the service decide what that means.

// Saves a new user. The password is hashed by the pre-save hook in user.model.ts
// before it reaches the database.
const create = async (fields: RegisterInput) => {
  const user = await User.create({
    username: fields.username,
    email: fields.email,
    password: fields.password,
  });

  return user;
};

// Returns the user with this email, or null if there is none.
const findByEmail = async (email: string) => {
  const user = await User.findOne({ email: email });

  return user;
};

export { create, findByEmail };
