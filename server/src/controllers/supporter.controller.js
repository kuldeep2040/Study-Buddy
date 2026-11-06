// Read-only views for supporters + their Telegram connection. `serverTime` powers live timers.
import * as supporterService from '../services/supporter.service.js';
import * as telegramConnect from '../services/telegramConnect.service.js';

const serverTime = () => new Date().toISOString();

export async function dashboard(req, res) {
  res.json({ ...(await supporterService.getSupporterDashboard(req.user)), serverTime: serverTime() });
}

export async function studentOverview(req, res) {
  // req.linkedStudentId / req.supportLinkId were verified against the database by requireLinkedStudent
  const student = await supporterService.getStudentOverview(req.linkedStudentId, req.supportLinkId);
  res.json({ student, serverTime: serverTime() });
}

export async function connectTelegram(req, res) {
  res.status(201).json(await telegramConnect.createConnectLink(req.user, req.valid.params.linkId));
}

export async function disconnectTelegram(req, res) {
  res.json(await telegramConnect.disconnect(req.user, req.valid.params.linkId));
}
