// Guard for /api/jobs/*: the caller (cron-job.org) must send the header  x-cron-secret: <CRON_SECRET>
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { safeEqual } from '../utils/safeCompare.js';

export function requireCronSecret(req, res, next) {
  if (!safeEqual(req.get('x-cron-secret'), env.CRON_SECRET)) {
    throw new AppError(401, 'Invalid or missing cron secret');
  }
  next();
}
