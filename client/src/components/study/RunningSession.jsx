// Shown while a session is running: a big circle with the live timer, then Stop.
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
    <div className="flex flex-col items-center text-center">
      <div className="rounded-full bg-accent-soft/30 p-2.5">
        <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full bg-surface shadow-sm ring-[6px] ring-accent">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" aria-hidden="true" />
            Studying {session.subject}
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-ink tabular-nums" role="timer" aria-label={`Elapsed time ${clock}`}>
            {clock}
          </p>
          <p className="mt-0.5 text-xs text-muted">since {formatTime(session.startTime)}</p>
        </div>
      </div>

      <Button variant="danger" className="mt-4 w-full max-w-xs rounded-full" loading={stopping} onClick={onStop}>
        ⏹ Stop
      </Button>
      <p className="mt-2 text-xs text-muted">Forgot to stop? Sessions stop automatically after {AUTO_STOP_HOURS} hours.</p>
    </div>
  );
}
