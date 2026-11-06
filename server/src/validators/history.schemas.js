import { z } from 'zod';
import { dateString } from './common.schemas.js';

// Query strings are always text, so z.coerce turns "14" into the number 14.
export const historyQuerySchema = z.object({
  days: z.coerce
    .number({ error: 'days must be a number' })
    .int()
    .min(1, { error: 'days must be at least 1' })
    .max(60, { error: 'days can be at most 60' })
    .default(14),
  before: dateString('before date').optional(),
});
