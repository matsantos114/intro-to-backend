import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import type { FieldError } from "../utils/AppError.js";

// Every error response in this API has the same shape:
//   { "error": { "message": "...", "fields": [ ... ] } }
// `fields` is only included when there are field problems (validation errors).

// The shape of the `error` object we send.
// The question mark makes `fields` optional: a 404 has no fields to report.
type ErrorBody = {
  message: string;
  fields?: FieldError[];
};

// Runs only when no route matched the request.
// Example: the client calls GET /api/v1/banana, which does not exist.
export const notFound = (req: Request, res: Response) => {
  const errorBody: ErrorBody = {
    message: "Route not found: " + req.method + " " + req.originalUrl,
  };

  res.status(404).json({ error: errorBody });
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
  // It is safe to show its message (and its field problems) to the client.
  if (error instanceof AppError) {
    const errorBody: ErrorBody = {
      message: error.message,
    };

    // Only add `fields` when there is something in it.
    if (error.fields.length > 0) {
      errorBody.fields = error.fields;
    }

    res.status(error.statusCode).json({ error: errorBody });
    return;
  }

  // Case 2: anything else is unexpected (a bug, or the database being down).
  // Print the details in our terminal so we can debug it,
  // but send the client only a generic message so we do not leak internals.
  console.error(error);

  const errorBody: ErrorBody = {
    message: "Internal Server Error",
  };

  res.status(500).json({ error: errorBody });
};
