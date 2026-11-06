// /api/supporter/* — supporters only. Student data is READ-ONLY (GET routes only).
import { Router } from 'express';
import * as supporterController from '../controllers/supporter.controller.js';
import * as historyController from '../controllers/history.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { requireLinkedStudent } from '../middleware/requireLinkedStudent.js';
import { validate } from '../middleware/validate.js';
import { studentParamsSchema, linkParamsSchema } from '../validators/link.schemas.js';
import { historyQuerySchema } from '../validators/history.schemas.js';

export const supporterRouter = Router();

supporterRouter.use(requireAuth, requireRole('supporter'));

supporterRouter.get('/students', supporterController.dashboard);

// Every route touching ONE student's data goes through requireLinkedStudent (DB check each time).
supporterRouter.get(
  '/students/:studentId/overview',
  validate({ params: studentParamsSchema }),
  requireLinkedStudent,
  supporterController.studentOverview,
);
supporterRouter.get(
  '/students/:studentId/history',
  validate({ params: studentParamsSchema, query: historyQuerySchema }),
  requireLinkedStudent,
  historyController.ofLinkedStudent,
);

// The supporter's OWN Telegram connection for one link (not student data).
supporterRouter.post('/links/:linkId/telegram', validate({ params: linkParamsSchema }), supporterController.connectTelegram);
supporterRouter.delete('/links/:linkId/telegram', validate({ params: linkParamsSchema }), supporterController.disconnectTelegram);
