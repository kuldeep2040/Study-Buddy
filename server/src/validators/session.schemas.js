import { z } from 'zod';
import { subjectName } from './common.schemas.js';

export const startSessionSchema = z.object({ subject: subjectName });
