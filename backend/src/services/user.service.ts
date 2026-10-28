import * as userRepository from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";
import type { RegisterInput, LoginInput } from "../schemas/user.schema.js";

// The user service holds the business rules for users.
// It never sees `req` or `res`, and it never talks to the database directly.
// For data, it asks the user repository.

// The fields of a user that are safe to send to a client.
// The password hash is deliberately NOT in this list.
type PublicUser = {
  id: string;
  email: string;
  username: string;
};

// The parts of a database user that toPublicUser reads.
// `_id` is MongoDB's id object. All we need from it is that it can turn itself
// into a string, so we describe it as "something with a toString() method".
type UserFromDatabase = {
  _id: { toString(): string };
  email: string;
  username: string;
};

// Rule: a user leaving this service never carries the password hash.
// Every function below returns a PublicUser instead of the raw database user.
const toPublicUser = (user: UserFromDatabase) => {
  const publicUser: PublicUser = {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
  };

  return publicUser;
};

const registerUser = async (input: RegisterInput) => {
  // Rule: one account per email address.
  const existingUser = await userRepository.findByEmail(input.email);
  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  const user = await userRepository.create(input);

  return toPublicUser(user);
};

const loginUser = async (input: LoginInput) => {
  const user = await userRepository.findByEmail(input.email);

  // Rule: the SAME message whether the email is unknown or the password is wrong.
  // Different messages would tell an attacker which emails have accounts.
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  // comparePassword is a method from user.model.ts (a Mongoose feature).
  // It moves into this service when we leave Mongoose in step 4.
  const passwordMatches = await user.comparePassword(input.password);
  if (!passwordMatches) {
    throw new AppError(401, "Invalid credentials");
  }

  return toPublicUser(user);
};

const logoutUser = async (email: string) => {
  // Rule: you can only log out a user that exists.
  // There is nothing else to do yet, because login does not issue a token or session.
  // That changes in step 5.
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError(404, "User not found");
  }
};

export { registerUser, loginUser, logoutUser };
