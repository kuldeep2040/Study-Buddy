// Runs when no route matched → JSON 404 (instead of Express's default HTML page).
import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(404, 'Route not found'));
}
