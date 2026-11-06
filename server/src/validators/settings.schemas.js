import { z } from 'zod';
import { dateString } from './common.schemas.js';

// PATCH: every field is optional, but at least one must be sent. Unknown fields are dropped.
export const updateSettingsSchema = z
  .object({
    examName: z
      .string({ error: 'Please enter the exam name' })
      .trim()
      .min(1, { error: 'Please enter the exam name' })
      .max(60, { error: 'Exam name must be at most 60 characters' }),
    examDate: dateString('exam date'),
    dailyGoalMinutes: z
      .number({ error: 'Daily goal must be a number of minutes' })
      .int({ error: 'Daily goal must be whole minutes' })
      .min(15, { error: 'Daily goal must be at least 15 minutes' })
      .max(960, { error: 'Daily goal can be at most 16 hours' }),
    requireSupporterBeforeStudy: z.boolean({ error: 'Must be true or false' }),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, { error: 'Nothing to update' });
