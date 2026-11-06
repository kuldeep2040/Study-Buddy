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

/** mode: 'normal' | 'pomodoro'. → { session, serverTime } */
export async function startSession(subject, mode = 'normal') {
  const { data } = await api.post('/sessions/start', { subject, mode });
  return data;
}

/** Pause focus time (the session stays open). → { session, serverTime } */
export async function pauseSession() {
  const { data } = await api.post('/sessions/pause');
  return data;
}

/** End a pause, or a Pomodoro break ("Start next round"). → { session, serverTime } */
export async function resumeSession() {
  const { data } = await api.post('/sessions/resume');
  return data;
}

/** → { session, todayTotalMinutes, dailyGoalMinutes, serverTime } */
export async function stopSession() {
  const { data } = await api.post('/sessions/stop');
  return data;
}
