// /api/settings — students only.  /api/onboarding — any logged-in user.
import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settings.schemas.js';

export const settingsRouter = Router();
settingsRouter.use(requireAuth, requireRole('student'));
settingsRouter.get('/', settingsController.get);
settingsRouter.patch('/', validate({ body: updateSettingsSchema }), settingsController.update);

export const onboardingRouter = Router();
onboardingRouter.post('/complete', requireAuth, settingsController.completeOnboarding);
