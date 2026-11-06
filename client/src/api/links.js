// Student ↔ supporter links: invite → request (pending) → accept/decline → end.
import { api } from './client.js';

// ---- student

/** → { supporters, requests, pendingInvite, notices } */
export async function listMyLinks({ signal } = {}) {
  const { data } = await api.get('/links', { signal });
  return data;
}

/** New one-time invite code (the old unused one stops working). → { linkId, code, expiresAt } */
export async function createInvite() {
  const { data } = await api.post('/links/invite');
  return data.invite;
}

export async function acceptRequest(linkId) {
  const { data } = await api.post(`/links/${linkId}/accept`);
  return data;
}

export async function declineRequest(linkId) {
  const { data } = await api.post(`/links/${linkId}/decline`);
  return data;
}

// ---- supporter

/** → { linkId, status: 'pending', telegramConnected, student: { id, name } } */
export async function redeemInvite(code) {
  const { data } = await api.post('/links/redeem', { code });
  return data;
}

// ---- either side

/** Ends a link (or cancels an unused invite / a pending request). */
export async function endLink(linkId) {
  const { data } = await api.delete(`/links/${linkId}`);
  return data;
}

/** Hides an "X ended the link / declined" message. */
export async function dismissNotice(linkId) {
  const { data } = await api.post(`/links/${linkId}/dismiss-notice`);
  return data;
}
