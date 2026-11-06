// /api/history — the student's own study history.
import { Router } from 'express';
import * as historyController from '../controllers/history.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { historyQuerySchema } from '../validators/history.schemas.js';

export const historyRouter = Router();

historyRouter.get('/', requireAuth, requireRole('student'), validate({ query: historyQuerySchema }), historyController.mine);
