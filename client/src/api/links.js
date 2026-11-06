// Student ↔ supporter links: the student creates a code → the supporter enters it and is linked
// straight away → only the supporter can end it ("stop following").
import { api } from './client.js';

// ---- student

/** → { supporters, pendingInvite, notices } */
export async function listMyLinks({ signal } = {}) {
  const { data } = await api.get('/links', { signal });
  return data;
}

/** New one-time invite code (the old unused one stops working). → { linkId, code, expiresAt } */
export async function createInvite() {
  const { data } = await api.post('/links/invite');
  return data.invite;
}

// ---- supporter

/** → { linkId, status: 'active', telegramConnected, student: { id, name } } */
export async function redeemInvite(code) {
  const { data } = await api.post('/links/redeem', { code });
  return data;
}

// ---- either side

/** Student: cancel an unused invite code. Supporter: stop following a student. */
export async function endLink(linkId) {
  const { data } = await api.delete(`/links/${linkId}`);
  return data;
}

/** Hides a link message ("X is now your supporter" / "X stopped following"). */
export async function dismissNotice(linkId) {
  const { data } = await api.post(`/links/${linkId}/dismiss-notice`);
  return data;
}
