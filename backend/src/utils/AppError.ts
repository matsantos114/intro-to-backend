// One problem with one field of the request, for example:
//   { field: "age", message: "Age must be a number" }
export type FieldError = {
  field: string;
  message: string;
};

// An error we throw on purpose.
// It carries the message, the HTTP status code the client should receive,
// and, for validation errors, the list of fields that were wrong.
// Anything that is NOT an AppError is a bug or an outage, and will become a 500.
export class AppError extends Error {
  // Declare the extra properties that a plain Error does not have.
  statusCode: number;
  fields: FieldError[];

  // The question mark on `fields?` makes that parameter optional.
  // Most errors (like a 404) have no field problems, so callers can leave it out:
  //   new AppError(404, "Post not found")
  //   new AppError(400, "Invalid request body", listOfFieldErrors)
  constructor(statusCode: number, message: string, fields?: FieldError[]) {
    // Hand the message to the built-in Error so it can set itself up.
    // This must come before we use `this`.
    super(message);

    // Save the status code on this error object.
    this.statusCode = statusCode;

    // Save the field problems. If none were given, store an empty list,
    // so code reading `error.fields` never has to handle "undefined".
    if (fields === undefined) {
      this.fields = [];
    } else {
      this.fields = fields;
    }

    // Label the error so it reads "AppError" in logs.
    this.name = "AppError";
  }
}
