import { z } from 'zod';
import { dateString } from './common.schemas.js';

const wholeMinutes = (label, min, max) =>
  z
    .number({ error: `${label} must be a number of minutes` })
    .int({ error: `${label} must be whole minutes` })
    .min(min, { error: `${label} must be at least ${min} minutes` })
    .max(max, { error: `${label} can be at most ${max} minutes` });

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
    // All four Pomodoro numbers are sent together.
    pomodoro: z.object({
      focusMinutes: wholeMinutes('Focus time', 5, 90),
      shortBreakMinutes: wholeMinutes('Short break', 1, 30),
      longBreakMinutes: wholeMinutes('Long break', 5, 60),
      roundsBeforeLongBreak: z
        .number({ error: 'Rounds must be a number' })
        .int({ error: 'Rounds must be a whole number' })
        .min(2, { error: 'At least 2 rounds before a long break' })
        .max(8, { error: 'At most 8 rounds before a long break' }),
    }),
    soundEnabled: z.boolean({ error: 'Must be true or false' }),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, { error: 'Nothing to update' });
