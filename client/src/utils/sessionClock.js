// SESSION CLOCK — the one place that answers "how much has been studied?" and "which Pomodoro
// phase are we in?" for a session at a given moment.
//
// ⚠️ This exact file also exists at client/src/utils/sessionClock.js. Keep the two IDENTICAL, so the
// student's timer, the supporter's view and the server always agree. (No imports on purpose.)
//
// The idea ("compute, don't count"): we never store a running counter. A session stores its start,
// its end (when finished) and a list of pauses. Everything else is calculated from those:
//   studied time = (end or now) − start − all pauses
// Pomodoro breaks ARE pauses (reason 'break'), so they automatically don't count as study time.
// A break starts by itself when a focus round is done, and stays open until the student taps
// "Start next round" (so waiting time doesn't count either).

const MINUTE_MS = 60 * 1000;
const toMs = (value) => (value == null ? null : new Date(value).getTime());

/** A pause open longer than this (on top of the break itself, for breaks) ends the session. */
export const MAX_PAUSE_MS = 60 * MINUTE_MS;

/** Length (ms) of the break that follows focus round `round` (1-based): every Nth one is long. */
export function breakLengthMs(pomodoro, round) {
  const isLong = round % pomodoro.roundsBeforeLongBreak === 0;
  return (isLong ? pomodoro.longBreakMinutes : pomodoro.shortBreakMinutes) * MINUTE_MS;
}

/**
 * The state of `session` at time `nowMs` (milliseconds).
 * Works with Date objects or ISO strings, so the browser can pass JSON straight in.
 *
 * → {
 *     studiedMs,        // time that counts as study (no pauses, no breaks)
 *     openPause,        // { reason: 'manual' | 'break', startMs } or null
 *     // Pomodoro only (null otherwise):
 *     round,            // the focus round in progress, or the one that just finished during a break
 *     focusLeftMs,      // time left in the current focus round
 *     breakMs,          // length of the current break
 *     breakLeftMs,      // time left in the break (≤ 0 = break over, waiting for "Start next round")
 *     pendingBreakAtMs, // a focus round finished at this moment but the break isn't saved yet
 *   }
 */
export function sessionClock(session, nowMs) {
  const startMs = toMs(session.startTime);
  const endMs = toMs(session.endTime) ?? nowMs; // finished sessions are frozen at their end
  const pauses = (session.pauses ?? []).map((p) => ({ reason: p.reason, startMs: toMs(p.start), endMs: toMs(p.end) }));

  const pausedMs = pauses.reduce((sum, p) => sum + Math.max(0, Math.min(p.endMs ?? endMs, endMs) - p.startMs), 0);
  const open = pauses.find((p) => p.endMs == null) ?? null;

  const state = {
    studiedMs: Math.max(0, endMs - startMs - pausedMs),
    openPause: open && { reason: open.reason, startMs: open.startMs },
    round: null,
    focusLeftMs: null,
    breakMs: null,
    breakLeftMs: null,
    pendingBreakAtMs: null,
  };
  if (session.mode !== 'pomodoro' || !session.pomodoro || session.endTime) return state;

  const focusMs = session.pomodoro.focusMinutes * MINUTE_MS;
  const breaks = pauses.filter((p) => p.reason === 'break');

  // On a break (it stays open until the student taps to start the next round).
  if (open?.reason === 'break') {
    state.round = breaks.length;
    state.breakMs = breakLengthMs(session.pomodoro, breaks.length);
    state.breakLeftMs = open.startMs + state.breakMs - nowMs;
    return state;
  }

  // In a focus round (possibly paused by hand). It began when the last break ended (or at Start).
  const roundStartMs = breaks.length ? breaks[breaks.length - 1].endMs : startMs;
  const manualPausedMs = pauses
    .filter((p) => p.reason !== 'break' && p.startMs >= roundStartMs)
    .reduce((sum, p) => sum + ((p.endMs ?? nowMs) - p.startMs), 0);
  const focusDoneMs = nowMs - roundStartMs - manualPausedMs;
  state.round = breaks.length + 1;

  if (!open && focusDoneMs >= focusMs) {
    // The round ended while nobody was looking (phone asleep): the break began at that exact moment,
    // so the time since then is break, not study.
    state.pendingBreakAtMs = roundStartMs + focusMs + manualPausedMs;
    state.studiedMs -= nowMs - state.pendingBreakAtMs;
    state.focusLeftMs = 0;
  } else {
    state.focusLeftMs = Math.max(0, focusMs - focusDoneMs);
  }
  return state;
}
