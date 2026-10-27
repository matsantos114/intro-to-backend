import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

// `validate` is a function that RECEIVES a schema and RETURNS a middleware.
// We call validate(...) once, when the server starts and the routes are set up.
// Express then calls the middleware it returned, on every request to that route.
export const validate = (schema: ZodType) => {
  const middleware = (req: Request, res: Response, next: NextFunction) => {
    // safeParse checks req.body against the schema.
    // It never throws. It gives back an object with a `success` field instead.
    const result = schema.safeParse(req.body);

    if (result.success === false) {
      // Turn the list of problems into one readable message,
      // for example: "age: Age must be a number, name: Name must be text"
      const problems: string[] = [];
      for (const issue of result.error.issues) {
        const fieldName = issue.path.join(".");
        problems.push(fieldName + ": " + issue.message);
      }
      const message = problems.join(", ");

      // Stop here. The controller never runs.
      throw new AppError(400, message);
    }

    // Replace the raw body with Zod's cleaned-up copy:
    // values are trimmed, and any fields not in the schema are removed.
    req.body = result.data;

    // Validation passed, so hand the request to the next function in the chain.
    next();
  };

  return middleware;
};
