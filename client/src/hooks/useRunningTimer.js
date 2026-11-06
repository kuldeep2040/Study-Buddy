// Everything a RUNNING session's timer needs, recalculated every second:
//   view  → phase, big number, ring progress, labels (utils/timerView.js)
// and the side effects:
//   • the browser tab title shows the timer ("24:13 · Physics", "⏰ Break over")
//   • a chime + notification when a focus round ends and when a break is over (Pomodoro)
//   • asks the server to check in when something should change there: a focus round finished
//     (the server saves the break and tells supporters) or an auto-stop rule kicked in.
import { useEffect, useRef } from 'react';
import { useNow } from './useNow.js';
import { MAX_PAUSE_MS, breakLengthMs, sessionClock } from '../utils/sessionClock.js';
import { describeTimer, formatCountdown } from '../utils/timerView.js';
import { AUTO_STOP_HOURS, formatClock } from '../utils/format.js';
import { notify, playChime } from '../utils/alerts.js';

const MAX_STUDY_MS = AUTO_STOP_HOURS * 60 * 60 * 1000;

export function useRunningTimer(session, clockOffsetMs, { soundEnabled, onServerCheck }) {
  const now = useNow(1000) + clockOffsetMs;
  const clock = sessionClock(session, now);
  const view = describeTimer(session, clock, now);
  const bigText = view.countdown ? formatCountdown(view.displayMs) : formatClock(view.displayMs);

  // Tab title, e.g. "24:13 · Physics". Restored when the session ends.
  const title = view.phase === 'break-over' ? `⏰ Break over · ${session.subject}` : `${bigText} · ${session.subject}`;
  useEffect(() => {
    document.title = title;
  }, [title]);
  useEffect(() => () => {
    document.title = 'Study Buddy';
  }, []);

  // Chime + notification when the phase changes by itself (not on first load).
  const previousPhase = useRef(view.phase);
  useEffect(() => {
    const before = previousPhase.current;
    previousPhase.current = view.phase;
    if (before === view.phase) return;
    if (before === 'focus' && (view.phase === 'break' || view.phase === 'break-over')) {
      if (soundEnabled) playChime('break');
      notify('Focus round done ☕', 'Nice work! Time for a break.');
    } else if (before === 'break' && view.phase === 'break-over') {
      if (soundEnabled) playChime('alert');
      notify('Break over ⏰', `Tap to start round ${view.nextRoundLabel}.`);
    }
  }, [view.phase, view.nextRoundLabel, soundEnabled]);

  // Ask the server to check in, once per event. The 1.5 s delay covers small clock differences
  // between phone and server (the server must agree the round is really over).
  const pauseAllowanceMs = MAX_PAUSE_MS + (clock.openPause?.reason === 'break' ? breakLengthMs(session.pomodoro, clock.round) : 0);
  const pauseTooLong = clock.openPause && now - clock.openPause.startMs > pauseAllowanceMs;
  const checkKey = clock.pendingBreakAtMs ? `round-${clock.round}` : clock.studiedMs >= MAX_STUDY_MS || pauseTooLong ? 'auto-stop' : null;
  const lastCheckKey = useRef(null);
  useEffect(() => {
    if (!checkKey || checkKey === lastCheckKey.current) return undefined;
    lastCheckKey.current = checkKey;
    const id = setTimeout(onServerCheck, 1500);
    return () => clearTimeout(id);
  }, [checkKey, onServerCheck]);

  return { view, clock, bigText };
}
