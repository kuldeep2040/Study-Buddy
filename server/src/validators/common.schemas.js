// Small zod building blocks shared by several validators.
import { z } from 'zod';

/** A MongoDB ObjectId in a URL, e.g. /api/subjects/6aece0ca90fc5a28870dfbc4 */
export const objectId = (label = 'id') =>
  z.string().regex(/^[a-f\d]{24}$/i, { error: `Invalid ${label}` });

/** A calendar date 'YYYY-MM-DD' that really exists (rejects '2026-02-31'). */
export const dateString = (label = 'date') =>
  z
    .string({ error: `Please enter a ${label}` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: `${label[0].toUpperCase()}${label.slice(1)} must look like 2026-03-15` })
    // NOTE: zod 4 runs this check even if the regex above failed, so it must never throw.
    .refine(
      (value) => {
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
      },
      { error: `That ${label} doesn't exist` },
    );

/** A subject name: trimmed, 1–30 characters. */
export const subjectName = z
  .string({ error: 'Please enter a subject name' })
  .trim()
  .min(1, { error: 'Please enter a subject name' })
  .max(30, { error: 'Subject name must be at most 30 characters' });
