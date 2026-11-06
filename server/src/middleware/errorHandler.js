// The ONE place where errors become HTTP responses. Express knows this is an error handler
// because it has 4 parameters (err, req, res, next). It must be registered LAST in app.js.
//
// Every error response has the same shape:  { error: { message, details? } }
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { isProduction } from '../config/env.js';

// eslint-disable-next-line no-unused-vars -- Express needs all 4 params to recognise an error handler
export function errorHandler(err, req, res, next) {
  const { statusCode, message, details } = toHttpError(err);

  if (statusCode >= 500) {
    // Unexpected bug → log the full error for us (never the request body: it may contain a password).
    console.error(`💥 ${req.method} ${req.originalUrl} →`, err);
  }

  res.status(statusCode).json({ error: details ? { message, details } : { message } });
}

// Translate different kinds of errors into { statusCode, message, details }.
function toHttpError(err) {
  // 1. Errors we threw on purpose
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message, details: err.details };
  }

  // 2. Body was not valid JSON (from express.json())
  if (err.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'Request body is not valid JSON' };
  }
  if (err.type === 'entity.too.large') {
    return { statusCode: 413, message: 'Request body is too large' };
  }

  // 3. Mongoose: a schema rule failed (backup for anything zod didn't catch)
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return { statusCode: 400, message: details[0]?.message || 'Invalid data', details };
  }

  // 4. Mongoose: an id in the URL wasn't a valid ObjectId
  if (err instanceof mongoose.Error.CastError) {
    return { statusCode: 400, message: `Invalid ${err.path}` };
  }

  // 5. MongoDB: a unique index was violated (e.g. email already used)
  if (err.code === 11000) {
    return { statusCode: 409, message: 'This already exists' };
  }

  // 6. Anything else is a bug. Don't leak internals to users in production.
  return {
    statusCode: 500,
    message: isProduction ? 'Something went wrong on our side. Please try again.' : err.message,
  };
}
