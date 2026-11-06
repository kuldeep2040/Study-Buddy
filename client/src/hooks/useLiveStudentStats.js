// Turns a student snapshot from the server into LIVE numbers that tick every second:
//   elapsedMs    → how long the current session has been running
//   totalMinutes → today's total, including the running session
// The snapshot was correct at `serverTime`; we add the time that has passed since then.
import { useNow } from './useNow.js';
import { istDateString } from '../utils/format.js';

export function useLiveStudentStats(student, serverTime, receivedAt) {
  const active = student.activeSession;
  const now = useNow(1000, Boolean(active));

  if (!active) return { elapsedMs: 0, totalMinutes: student.todayTotalMinutes };

  // "Server now" = phone now + (how far the server's clock was ahead of the phone when data arrived)
  const serverNow = now + (Date.parse(serverTime) - receivedAt);
  const elapsedMs = Math.max(0, serverNow - Date.parse(active.startTime));

  // The running session only counts toward today if it started today (server rule).
  const countsToday = istDateString(active.startTime) === student.date;
  const sinceSnapshotMin = Math.max(0, serverNow - Date.parse(serverTime)) / 60000;

  return {
    elapsedMs,
    totalMinutes: student.todayTotalMinutes + (countsToday ? sinceSnapshotMin : 0),
  };
}
