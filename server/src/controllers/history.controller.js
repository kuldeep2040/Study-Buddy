import { getHistory } from '../services/history.service.js';

// Student: my own history
export async function mine(req, res) {
  res.json({ ...(await getHistory(req.user.id, req.valid.query)), serverTime: new Date().toISOString() });
}

// Supporter: a linked student's history (requireLinkedStudent already checked the link)
export async function ofLinkedStudent(req, res) {
  res.json({ ...(await getHistory(req.linkedStudentId, req.valid.query)), serverTime: new Date().toISOString() });
}
