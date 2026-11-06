// Full-screen focus mode: a huge timer over the whole screen (sideways/landscape on phones),
// with Pause/Resume/End. Keeps the screen awake while open. Exit with the button, Escape,
// or the phone's back gesture (leaving browser full screen closes it too).
import { useEffect, useRef } from 'react';
import { exitFullscreen } from '../../utils/fullscreen.js';
import { keepAwake } from '../../utils/alerts.js';
import { formatDuration } from '../../utils/format.js';
import Icon from '../ui/Icon.jsx';
import TimerControls from './TimerControls.jsx';

const PHASE_COLOR = { 'break-over': 'text-highlight', break: 'text-highlight', paused: 'text-muted' };

export default function FullscreenTimer({ session, view, bigText, busy, onPause, onResume, onStop, onExit }) {
  const wasFullscreen = useRef(false);

  useEffect(() => {
    const release = keepAwake();
    document.body.style.overflow = 'hidden'; // the page behind must not scroll
    const onFullscreenChange = () => {
      if (document.fullscreenElement) wasFullscreen.current = true;
      else if (wasFullscreen.current) onExit(); // left browser full screen (back gesture / Esc)
    };
    const onKey = (event) => event.key === 'Escape' && onExit();
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('keydown', onKey);
    return () => {
      release();
      document.body.style.overflow = '';
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('keydown', onKey);
      exitFullscreen();
    };
  }, [onExit]);

  return (
    <div
      role="dialog"
      aria-label="Full-screen timer"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-page px-6 py-[max(1.5rem,env(safe-area-inset-top))] landscape:flex-row landscape:gap-12"
    >
      <button
        type="button"
        onClick={onExit}
        aria-label="Exit full screen"
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-ink-soft"
      >
        <Icon name="shrink" className="h-5 w-5" />
      </button>

      <div className="text-center">
        <p className={`text-lg font-semibold ${PHASE_COLOR[view.phase] ?? 'text-accent'}`}>
          {session.subject} · {view.label}
        </p>
        <p
          className={`leading-none font-bold tracking-tight tabular-nums ${view.phase === 'paused' ? 'text-muted' : 'text-ink'} ${view.phase === 'break-over' ? 'animate-pulse' : ''}`}
          style={{ fontSize: 'min(22vw, 38vh)' }}
          role="timer"
        >
          {view.phase === 'break-over' ? '0:00' : bigText}
        </p>
        {view.progress !== null && (
          <div className="mx-auto mt-4 h-2 w-full max-w-md rounded-full bg-surface-2" aria-hidden="true">
            <div className={`h-2 rounded-full ${view.phase.startsWith('break') ? 'bg-highlight' : 'bg-accent'}`} style={{ width: `${Math.min(view.progress, 1) * 100}%` }} />
          </div>
        )}
        <p className="mt-3 text-sm text-muted">
          {view.phase === 'break-over' ? `Break over! Ready for round ${view.nextRoundLabel}?` : `Studied ${formatDuration(view.studiedMs / 60000)} this session`}
        </p>
      </div>

      <div className="w-full max-w-sm landscape:w-56">
        <TimerControls view={view} busy={busy} onPause={onPause} onResume={onResume} onStop={onStop} large />
      </div>
    </div>
  );
}
