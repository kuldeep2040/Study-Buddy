// Scheduled jobs, triggered from outside (cron-job.org) because Render's free server sleeps.
import { autoStopExpiredSessions } from '../services/session.service.js';

export async function autoStop(req, res) {
  const closed = await autoStopExpiredSessions();
  console.info(`[job] auto-stop: closed ${closed} session(s)`);
  res.json({ job: 'auto-stop', closed, ranAt: new Date().toISOString() });
}
