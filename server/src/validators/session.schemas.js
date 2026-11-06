import { z } from 'zod';
import { subjectName } from './common.schemas.js';

export const startSessionSchema = z.object({
  subject: subjectName,
  mode: z.enum(['normal', 'pomodoro'], { error: "Mode must be 'normal' or 'pomodoro'" }).default('normal'),
});
