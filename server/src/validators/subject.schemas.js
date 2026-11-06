import { z } from 'zod';
import { objectId, subjectName } from './common.schemas.js';

export const subjectBodySchema = z.object({ name: subjectName });

export const subjectParamsSchema = z.object({ subjectId: objectId('subject id') });
