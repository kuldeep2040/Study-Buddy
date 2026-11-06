// /api/sessions/* — students only.
import { Router } from 'express';
import * as sessionController from '../controllers/session.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { startSessionSchema } from '../validators/session.schemas.js';

export const sessionRouter = Router();

sessionRouter.use(requireAuth, requireRole('student'));

sessionRouter.post('/start', validate({ body: startSessionSchema }), sessionController.start);
sessionRouter.post('/stop', sessionController.stop);
sessionRouter.get('/active', sessionController.active);
sessionRouter.get('/today', sessionController.today);
