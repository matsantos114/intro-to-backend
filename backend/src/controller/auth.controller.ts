import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";
import type { RegisterInput, LoginInput } from "../schemas/user.schema.js";

// The auth controller handles HTTP only, for register, login and logout.
// It calls the USER service, because those actions are about users.
// Each function is named handle... because it handles one HTTP request.
// That keeps it distinct from the service function it calls (userService.loginUser).
// Every function has three parts:
//   1. read what it needs from the request
//   2. hand the work to the user service
//   3. send the success response
// Every success response with a body has the same shape: { "data": ... }
// (Errors are shaped by errorHandler: { "error": { "message": ... } })
// It never talks to the database, and it has no try/catch:
// if the service throws, Express sends the error to errorHandler.

const handleRegister = async (req: Request, res: Response) => {
  // 1. Read. The validate middleware already checked this body against registerSchema.
  const input: RegisterInput = req.body;

  // 2. Delegate. The service throws a 409 if the email is already registered.
  const user = await userService.registerUser(input);

  // 3. Respond. `user` is a PublicUser, so it never contains the password hash.
  res.status(201).json({ data: user });
};

const handleLogin = async (req: Request, res: Response) => {
  // 1. Read. The validate middleware already checked this body against loginSchema.
  const input: LoginInput = req.body;

  // 2. Delegate. The service throws a 401 if the email or password is wrong.
  const user = await userService.loginUser(input);

  // 3. Respond.
  res.status(200).json({ data: user });
};

const handleLogout = async (req: Request, res: Response) => {
  // 1. Read. This body is NOT validated yet; logout is rewritten in step 5.
  const email = req.body.email;

  // 2. Delegate. The service throws a 404 if the user does not exist.
  await userService.logoutUser(email);

  // 3. Respond. 204: it worked, and there is nothing to send back.
  res.status(204).send();
};

export { handleRegister, handleLogin, handleLogout };
