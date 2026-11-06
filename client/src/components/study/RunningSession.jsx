// Shown while a session is running: a ring with the live timer, Pause/Resume/End, and a button
// for full-screen focus mode. Normal mode counts UP the study time; Pomodoro counts DOWN the
// current focus round or break. While paused, the time stands still.
// Nothing here counts seconds itself: every tick recalculates from the session's start and
// pauses (utils/sessionClock.js), so a refresh, a closed tab or a sleeping phone can't break it.
import { useCallback, useState } from 'react';
import { useRunningTimer } from '../../hooks/useRunningTimer.js';
import { AUTO_STOP_HOURS, formatDuration, formatTime } from '../../utils/format.js';
import { enterFullscreen } from '../../utils/fullscreen.js';
import ProgressRing from '../ui/ProgressRing.jsx';
import Icon from '../ui/Icon.jsx';
import TimerControls from './TimerControls.jsx';
import FullscreenTimer from './FullscreenTimer.jsx';

const RING_TONE = { break: 'highlight', 'break-over': 'highlight', paused: 'muted' };

export default function RunningSession({ session, clockOffsetMs, busy, soundEnabled, onPause, onResume, onStop, onServerCheck }) {
  const { view, bigText } = useRunningTimer(session, clockOffsetMs, { soundEnabled, onServerCheck });
  const [fullscreen, setFullscreen] = useState(false);
  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  function openFullscreen() {
    enterFullscreen(); // must start inside the tap (browsers only allow full screen from a user action)
    setFullscreen(true);
  }

  async function stop() {
    setFullscreen(false);
    await onStop();
  }

  return (
    <div className="flex flex-col items-center text-center" data-testid="running-session">
      {view.phase === 'break-over' && (
        <p role="alert" className="mb-3 w-full animate-pulse rounded-2xl bg-highlight-soft px-4 py-2.5 text-sm font-bold text-highlight">
          ⏰ Break over! Ready for round {view.nextRoundLabel}?
        </p>
      )}

      {/* The ring, with the full-screen button at its top-right (relative = position the button against this row) */}
      <div className="relative flex w-full justify-center">
        <button
          type="button"
          onClick={openFullscreen}
          aria-label="Full-screen timer"
          title="Full screen"
          className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink-soft shadow-sm hover:bg-surface-2"
        >
          <Icon name="expand" className="h-5 w-5" />
        </button>
        <div className="rounded-full bg-accent-soft/30 p-2.5">
          <div className="rounded-full bg-surface shadow-sm">
            <ProgressRing value={view.progress ?? 1} size={176} stroke={8} tone={RING_TONE[view.phase] ?? 'accent'} label={view.label}>
              <p
                className={`flex items-center gap-1.5 text-xs font-semibold ${view.phase === 'paused' ? 'text-muted' : view.phase.startsWith('break') ? 'text-highlight' : 'text-accent'}`}
              >
                {(view.phase === 'studying' || view.phase === 'focus') && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success" aria-hidden="true" />
                )}
                {view.isPomodoro ? view.label : view.phase === 'paused' ? `Paused · ${session.subject}` : `Studying ${session.subject}`}
              </p>
              <p
                className={`mt-1 text-4xl font-bold tracking-tight tabular-nums ${view.phase === 'paused' ? 'text-muted' : 'text-ink'}`}
                role="timer"
                aria-label={`Timer ${bigText}`}
              >
                {view.phase === 'break-over' ? '0:00' : bigText}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {view.isPomodoro
                  ? `${session.subject} · studied ${formatDuration(view.studiedMs / 60000)}`
                  : `since ${formatTime(session.startTime)}`}
              </p>
            </ProgressRing>
          </div>
        </div>
      </div>

      <div className="mt-4 w-full max-w-sm">
        <TimerControls view={view} busy={busy} onPause={onPause} onResume={onResume} onStop={stop} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {view.phase === 'paused'
          ? 'Paused time doesn’t count. A pause over 1 hour ends the session.'
          : `Forgot to stop? Sessions stop automatically after ${AUTO_STOP_HOURS} hours of study.`}
      </p>

      {fullscreen && (
        <FullscreenTimer
          session={session}
          view={view}
          bigText={bigText}
          busy={busy}
          onPause={onPause}
          onResume={onResume}
          onStop={stop}
          onExit={closeFullscreen}
        />
      )}
    </div>
  );
}
