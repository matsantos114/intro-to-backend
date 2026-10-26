import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

// Runs only when no route matched the request.
// Example: the client calls GET /api/v1/banana, which does not exist.
export const notFound = (req: Request, res: Response) => {
  const message = "Route not found: " + req.method + " " + req.originalUrl;
  res.status(404).json({ message: message });
};

// Runs whenever an error is thrown anywhere in a route or controller.
// Express knows this is an error handler because it has FOUR parameters.
// The first one is the error. `next` is unused here, but it must stay in the
// list, otherwise Express would treat this as a normal three-parameter handler.
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Case 1: an error we threw on purpose, like AppError(404, "Post not found").
  // It is safe to show its message to the client.
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  // Case 2: anything else is unexpected (a bug, or the database being down).
  // Print the details in our terminal so we can debug it,
  // but send the client only a generic message so we do not leak internals.
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
};
