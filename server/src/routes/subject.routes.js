// /api/subjects/* — students only.
import { Router } from 'express';
import * as subjectController from '../controllers/subject.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { subjectBodySchema, subjectParamsSchema } from '../validators/subject.schemas.js';

export const subjectRouter = Router();

// Applies to every route below: must be logged in AND a student.
subjectRouter.use(requireAuth, requireRole('student'));

subjectRouter.get('/', subjectController.list);
subjectRouter.post('/', validate({ body: subjectBodySchema }), subjectController.add);
subjectRouter.patch(
  '/:subjectId',
  validate({ params: subjectParamsSchema, body: subjectBodySchema }),
  subjectController.rename,
);
subjectRouter.delete('/:subjectId', validate({ params: subjectParamsSchema }), subjectController.remove);
