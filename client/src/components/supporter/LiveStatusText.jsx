// One line describing what a linked student is doing right now, for the supporter's screens:
// "Studying Physics · 0:25:09", "Physics · Focus round 2/4 · 12:30 left", "Paused · Physics",
// "On a break · 3:12 left", "Break over · back soon". Same maths as the student's own timer.
import { formatClock } from '../../utils/format.js';
import { formatCountdown } from '../../utils/timerView.js';

function liveStatus(subject, view) {
  switch (view.phase) {
    case 'paused':
      return { tone: 'paused', text: `Paused · ${subject} · ${formatClock(view.studiedMs)} studied` };
    case 'break':
      return { tone: 'break', text: `${view.label} · ${subject} · ${formatCountdown(view.displayMs)} left` };
    case 'break-over':
      return { tone: 'break', text: `Break over · ${subject} · starting round ${view.nextRoundLabel} soon` };
    case 'focus':
      return { tone: 'studying', text: `${subject} · ${view.label} · ${formatCountdown(view.displayMs)} left` };
    default:
      return { tone: 'studying', text: `Studying ${subject} · ${formatClock(view.studiedMs)}` };
  }
}

const TONES = {
  studying: { pill: 'bg-success-soft text-success', dot: 'animate-pulse bg-success', text: 'text-success' },
  paused: { pill: 'bg-surface-2 text-ink-soft', dot: 'bg-faint', text: 'text-muted' },
  break: { pill: 'bg-highlight-soft text-highlight', dot: 'bg-highlight', text: 'text-highlight' },
};

/** `pill` = the rounded badge (student page); otherwise a plain coloured line (dashboard card). */
export default function LiveStatusText({ subject, view, pill = false }) {
  if (!view) {
    return pill ? (
      <p className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold text-ink-soft" data-testid="status-pill">
        <span className="h-2 w-2 rounded-full bg-faint" aria-hidden="true" />
        Not studying right now
      </p>
    ) : (
      <p className="text-sm text-muted">Not studying right now</p>
    );
  }
  const { tone, text } = liveStatus(subject, view);
  const style = TONES[tone];
  return (
    <p
      className={pill ? `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${style.pill}` : `flex items-center gap-1.5 text-sm font-semibold ${style.text}`}
      data-testid={pill ? 'status-pill' : undefined}
      role="timer"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
      <span className="tabular-nums">{text}</span>
    </p>
  );
}
