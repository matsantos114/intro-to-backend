import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";
import type { FieldError } from "../utils/AppError.js";

// `validate` is a function that RECEIVES a schema and RETURNS a middleware.
// We call validate(...) once, when the server starts and the routes are set up.
// Express then calls the middleware it returned, on every request to that route.
export const validate = (schema: ZodType) => {
  const middleware = (req: Request, res: Response, next: NextFunction) => {
    // safeParse checks req.body against the schema.
    // It never throws. It gives back an object with a `success` field instead.
    const result = schema.safeParse(req.body);

    if (result.success === false) {
      // Turn each Zod problem into one FieldError, so a client can tell
      // exactly which field was wrong, for example:
      //   [{ field: "age", message: "Age must be a number" },
      //    { field: "name", message: "Name must be text" }]
      const fields: FieldError[] = [];
      for (const issue of result.error.issues) {
        const fieldName = issue.path.join(".");
        const fieldError: FieldError = {
          field: fieldName,
          message: issue.message,
        };
        fields.push(fieldError);
      }

      // Stop here. The controller never runs.
      throw new AppError(400, "Invalid request body", fields);
    }

    // Replace the raw body with Zod's cleaned-up copy:
    // values are trimmed, and any fields not in the schema are removed.
    req.body = result.data;

    // Validation passed, so hand the request to the next function in the chain.
    next();
  };

  return middleware;
};
