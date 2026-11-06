// Today's study minutes, LIVE: finished sessions use their saved duration; a running session counts
// its study time so far (pauses and breaks excluded — see utils/sessionClock.js), corrected by the
// server clock offset. Re-calculates every 10 seconds while something is running.
import { useNow } from './useNow.js';
import { sessionClock } from '../utils/sessionClock.js';
import { AUTO_STOP_HOURS } from '../utils/format.js';

const MAX_MINUTES = AUTO_STOP_HOURS * 60;

/** Minutes for one session: finished → its saved duration; running → study time so far. */
export function sessionMinutes(session, nowMs) {
  if (session.status === 'active') return Math.min(sessionClock(session, nowMs).studiedMs / 60000, MAX_MINUTES);
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
