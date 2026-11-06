// An "expected" error we throw on purpose, with the HTTP status code to send.
// Example: throw new AppError(409, 'You already have an active session');
// The central errorHandler turns it into: { error: { message, details? } }
export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details; // optional, e.g. a list of field errors from validation
  }
}
