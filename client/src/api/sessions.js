// Study session API calls. Every response includes `serverTime` (used to correct the phone's clock).
import { api } from './client.js';

// `signal` (optional) lets the caller cancel the request, e.g. when the page is closed.

/** → { session: Session | null, serverTime } */
export async function getActiveSession({ signal } = {}) {
  const { data } = await api.get('/sessions/active', { signal });
  return data;
}

/** → { date, totalMinutes, sessions: Session[], serverTime } (today in India time) */
export async function getTodaySessions({ signal } = {}) {
  const { data } = await api.get('/sessions/today', { signal });
  return data;
}

/** → { session, serverTime } */
export async function startSession(subject) {
  const { data } = await api.post('/sessions/start', { subject });
  return data;
}

/** → { session, todayTotalMinutes, serverTime } */
export async function stopSession() {
  const { data } = await api.post('/sessions/stop');
  return data;
}
