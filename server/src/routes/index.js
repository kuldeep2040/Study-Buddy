// Collects every router under /api. New feature routers get added here.
import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { subjectRouter } from './subject.routes.js';
import { sessionRouter } from './session.routes.js';
import { linkRouter } from './link.routes.js';
import { supporterRouter } from './supporter.routes.js';
import { jobRouter } from './job.routes.js';
import { settingsRouter, onboardingRouter } from './settings.routes.js';
import { historyRouter } from './history.routes.js';
import { telegramRouter } from './telegram.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/subjects', subjectRouter);
apiRouter.use('/sessions', sessionRouter);
apiRouter.use('/links', linkRouter);
apiRouter.use('/supporter', supporterRouter);
apiRouter.use('/jobs', jobRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/onboarding', onboardingRouter);
apiRouter.use('/history', historyRouter);
apiRouter.use('/telegram', telegramRouter);
