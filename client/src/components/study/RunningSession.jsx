// Shown while a session is running: big live timer + Stop button.
// The timer is NOT a counter that adds 1 every second. Each tick it recalculates
// "now − startTime" (corrected by the server clock offset), so it's always right — even after
// a refresh, a closed tab, or the phone sleeping.
import { useEffect } from 'react';
import { useNow } from '../../hooks/useNow.js';
import { AUTO_STOP_HOURS, formatClock, formatTime } from '../../utils/format.js';
import Button from '../ui/Button.jsx';

export default function RunningSession({ session, clockOffsetMs, onStop, stopping, onLimitReached }) {
  const now = useNow(1000);
  const elapsedMs = now + clockOffsetMs - Date.parse(session.startTime);
  const clock = formatClock(elapsedMs);
  const reachedLimit = elapsedMs >= AUTO_STOP_HOURS * 60 * 60 * 1000;

  // Show the timer in the browser tab title too, e.g. "0:25:09 · Physics".
  useEffect(() => {
    document.title = `${clock} · ${session.subject}`;
  }, [clock, session.subject]);
  useEffect(() => () => {
    document.title = 'Study Buddy'; // restore when the session ends
  }, []);

  // At 4 hours the server auto-stops the session; ask it for the new state once.
  useEffect(() => {
    if (reachedLimit) onLimitReached();
  }, [reachedLimit, onLimitReached]);

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-indigo-700">
        <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
        Studying {session.subject}
      </p>
      <p
        className="mt-2 text-6xl font-bold tracking-tight text-slate-900 tabular-nums"
        role="timer"
        aria-label={`Elapsed time ${clock}`}
      >
        {clock}
      </p>
      <p className="mt-1 text-sm text-slate-500">Started at {formatTime(session.startTime)}</p>

      <Button variant="danger" size="lg" className="mt-6 w-full" loading={stopping} onClick={onStop}>
        ⏹ Stop
      </Button>
      <p className="mt-3 text-xs text-slate-500">
        Forgot to stop? Sessions stop automatically after {AUTO_STOP_HOURS} hours.
      </p>
    </div>
  );
}
