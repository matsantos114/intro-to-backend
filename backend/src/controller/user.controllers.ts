import type { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import type { RegisterInput, LoginInput } from "../schemas/user.schema.js";

// There is no try/catch in this file on purpose.
// When something throws, Express sends the error to errorHandler,
// which decides what the client sees.

const registeredUser = async (req: Request, res: Response) => {
  // The validate middleware already checked this body against registerSchema,
  // so every field is present and valid. The email and username are also
  // already trimmed and lowercased.
  const input: RegisterInput = req.body;

  // check whether this email is already registered
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  const user = await User.create({
    username: input.username,
    email: input.email,
    password: input.password,
  });

  res.status(201).json({
    message: "User registered",
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
    },
  });
};

const loginUser = async (req: Request, res: Response) => {
  // The validate middleware already checked this body against loginSchema,
  // so the password is guaranteed to be present text.
  const input: LoginInput = req.body;

  const user = await User.findOne({ email: input.email });

  // We use the SAME message whether the email is unknown or the password is wrong.
  // Different messages would tell an attacker which emails have accounts.
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const passwordMatches = await user.comparePassword(input.password);
  if (!passwordMatches) {
    throw new AppError(401, "Invalid credentials");
  }

  res.status(200).json({
    message: "User logged in",
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
    },
  });
};

const logoutUser = async (req: Request, res: Response) => {
  const email = req.body.email;

  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Nothing to undo yet, because login does not issue a token or session.
  // That changes when we add real authentication.
  res.status(200).json({
    message: "Logout successful",
  });
};

export { registeredUser, loginUser, logoutUser };
