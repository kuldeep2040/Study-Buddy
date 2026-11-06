// HTTP layer for sessions. `serverTime` lets the browser correct for a wrong phone clock
// when it shows the live timer (timer = serverTime-adjusted now − startTime).
import * as sessionService from '../services/session.service.js';

const serverTime = () => new Date().toISOString();

export async function start(req, res) {
  const session = await sessionService.startSession(req.user, req.valid.body.subject, req.valid.body.mode);
  res.status(201).json({ session, serverTime: serverTime() });
}

export async function pause(req, res) {
  const session = await sessionService.pauseSession(req.user);
  res.json({ session, serverTime: serverTime() });
}

export async function resume(req, res) {
  const session = await sessionService.resumeSession(req.user);
  res.json({ session, serverTime: serverTime() });
}

export async function stop(req, res) {
  const result = await sessionService.stopSession(req.user);
  res.json({ ...result, serverTime: serverTime() });
}

export async function active(req, res) {
  const session = await sessionService.getActiveSession(req.user);
  res.json({ session, serverTime: serverTime() });
}

export async function today(req, res) {
  const summary = await sessionService.getTodaySummary(req.user);
  res.json({ ...summary, serverTime: serverTime() });
}
