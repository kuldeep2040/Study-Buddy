// /api/jobs/* — protected by the CRON_SECRET header, not by a user login.
import { Router } from 'express';
import * as jobController from '../controllers/job.controller.js';
import { requireCronSecret } from '../middleware/requireCronSecret.js';

export const jobRouter = Router();

jobRouter.use(requireCronSecret);

jobRouter.post('/auto-stop', jobController.autoStop);
