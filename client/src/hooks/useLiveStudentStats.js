// Turns a student snapshot from the server into LIVE numbers for the supporter's screens:
//   view         → the running session as the student sees it (phase, timer, labels), or null
//   elapsedMs    → study time of the running session (pauses and breaks excluded)
//   totalMinutes → today's total, including the running session
// The snapshot was correct at `serverTime`; the shared session clock (utils/sessionClock.js)
// tells us how much MORE has been studied since then (nothing while paused).
import { useNow } from './useNow.js';
import { istDateString } from '../utils/format.js';
import { sessionClock } from '../utils/sessionClock.js';
import { describeTimer } from '../utils/timerView.js';

export function useLiveStudentStats(student, serverTime, receivedAt) {
  const active = student.activeSession;
  const now = useNow(1000, Boolean(active));

  if (!active) return { view: null, elapsedMs: 0, totalMinutes: student.todayTotalMinutes };

  // "Server now" = phone now + (how far the server's clock was ahead of the phone when data arrived)
  const snapshotMs = Date.parse(serverTime);
  const serverNow = now + (snapshotMs - receivedAt);
  const clockNow = sessionClock(active, serverNow);
  const grownMinutes = Math.max(0, clockNow.studiedMs - sessionClock(active, snapshotMs).studiedMs) / 60000;

  // The running session only counts toward today if it started today (server rule).
  const countsToday = istDateString(active.startTime) === student.date;

  return {
    view: describeTimer(active, clockNow, serverNow),
    elapsedMs: clockNow.studiedMs,
    totalMinutes: student.todayTotalMinutes + (countsToday ? grownMinutes : 0),
  };
}
