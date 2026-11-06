// Today's study minutes, LIVE: finished sessions use their saved duration, a running session
// counts "now − start" (corrected by the server clock offset). Re-calculates every 10 seconds
// while something is running — enough for "1h 25m" precision, and it saves battery.
import { useNow } from './useNow.js';

/** Minutes for one session: finished → its saved duration; running → time so far. */
export function sessionMinutes(session, nowMs) {
  if (session.status === 'active') return Math.max(0, nowMs - Date.parse(session.startTime)) / 60000;
  return session.durationMinutes || 0;
}

export function useTodayTotal(sessions, clockOffsetMs) {
  const hasRunning = sessions.some((s) => s.status === 'active');
  const now = useNow(10000, hasRunning) + clockOffsetMs;
  return {
    now,
    totalMinutes: sessions.reduce((sum, s) => sum + sessionMinutes(s, now), 0),
  };
}
