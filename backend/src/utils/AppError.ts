// An error we throw on purpose.
// It carries two things: the message, and the HTTP status code the client should receive.
// Anything that is NOT an AppError is a bug or an outage, and will become a 500.
export class AppError extends Error {
  // Declare the extra property that a plain Error does not have.
  statusCode: number;

  constructor(statusCode: number, message: string) {
    // Hand the message to the built-in Error so it can set itself up.
    // This must come before we use `this`.
    super(message);

    // Save the status code on this error object.
    this.statusCode = statusCode;

    // Label the error so it reads "AppError" in logs.
    this.name = "AppError";
  }
}
