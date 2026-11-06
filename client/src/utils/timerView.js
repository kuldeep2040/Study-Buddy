// Turns the raw session clock (utils/sessionClock.js) into what the TIMER SCREEN shows:
// which phase we're in, the big number, the ring progress and the labels.
// Used by the student's timer, the full-screen mode and the supporter's live status.
import { breakLengthMs } from './sessionClock.js';

const MINUTE_MS = 60 * 1000;

/**
 * → {
 *   phase: 'studying' | 'focus' | 'paused' | 'break' | 'break-over',
 *   displayMs,   // the big number (count-up study time, or a Pomodoro countdown)
 *   countdown,   // true = displayMs counts DOWN
 *   progress,    // 0–1 for the ring (null = no progress ring, normal timer)
 *   label,       // "Focus · round 2/4", "Short break", "Paused"…
 *   nextRound,   // during a break: the round that comes next
 *   studiedMs,
 * }
 */
export function describeTimer(session, clock, nowMs) {
  const base = { studiedMs: clock.studiedMs, isPomodoro: session.mode === 'pomodoro' && Boolean(session.pomodoro) };

  if (!base.isPomodoro) {
    const paused = Boolean(clock.openPause);
    return { ...base, phase: paused ? 'paused' : 'studying', displayMs: clock.studiedMs, countdown: false, progress: null, label: paused ? 'Paused' : 'Studying' };
  }

  const p = session.pomodoro;
  const roundOfCycle = (round) => `${((round - 1) % p.roundsBeforeLongBreak) + 1}/${p.roundsBeforeLongBreak}`;

  // On a break: either saved by the server, or a round that just finished here and isn't saved yet.
  const breakStartMs = clock.openPause?.reason === 'break' ? clock.openPause.startMs : clock.pendingBreakAtMs;
  if (breakStartMs != null) {
    const breakMs = breakLengthMs(p, clock.round);
    // Capped: if the phone's clock is a hair behind the server's, never show more than the full break.
    const leftMs = Math.min(breakStartMs + breakMs - nowMs, breakMs);
    const isLong = clock.round % p.roundsBeforeLongBreak === 0;
    const next = { nextRound: clock.round + 1, nextRoundLabel: roundOfCycle(clock.round + 1) };
    if (leftMs <= 0) return { ...base, ...next, phase: 'break-over', displayMs: 0, countdown: true, progress: 1, label: 'Break over' };
    return { ...base, ...next, phase: 'break', displayMs: leftMs, countdown: true, progress: 1 - leftMs / breakMs, label: isLong ? 'Long break' : 'Short break' };
  }

  const focusMs = p.focusMinutes * MINUTE_MS;
  const paused = Boolean(clock.openPause);
  const focusLeftMs = Math.min(clock.focusLeftMs, focusMs); // same clock-difference guard ("25:01")
  return {
    ...base,
    phase: paused ? 'paused' : 'focus',
    displayMs: focusLeftMs,
    countdown: true,
    progress: 1 - focusLeftMs / focusMs,
    label: paused ? `Paused · round ${roundOfCycle(clock.round)}` : `Focus · round ${roundOfCycle(clock.round)}`,
    round: clock.round,
  };
}

/** Countdown text: "24:59", or "1:05:00" for an hour or more. Rounds UP, so it shows 0:00 only at the end. */
export function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
