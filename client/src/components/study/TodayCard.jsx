// "Today's sessions": one row per session with its subject colour, time range and duration.
import { formatDuration, formatTime } from '../../utils/format.js';
import { sessionMinutes } from '../../hooks/useTodayTotal.js';
import { subjectColor } from '../../utils/subjectColors.js';
import { sessionClock } from '../../utils/sessionClock.js';
import Card from '../ui/Card.jsx';

const BADGES = {
  running: { label: 'In progress', className: 'bg-success-soft text-success' },
  paused: { label: 'Paused', className: 'bg-surface-2 text-muted' },
  break: { label: 'On a break', className: 'bg-highlight-soft text-highlight' },
  'auto-stopped': { label: 'Auto-stopped', className: 'bg-warn-soft text-warn-ink' },
};

/** Which badge (if any) a session gets right now. */
function badgeFor(session, now) {
  if (session.status === 'auto-stopped') return BADGES['auto-stopped'];
  if (session.status !== 'active') return null;
  const { openPause, pendingBreakAtMs } = sessionClock(session, now);
  if (openPause?.reason === 'break' || pendingBreakAtMs) return BADGES.break;
  return openPause ? BADGES.paused : BADGES.running;
}

export default function TodayCard({ sessions, now }) {
  return (
    <section aria-label="Today's sessions" className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-lg font-bold text-ink">Today&apos;s sessions</h2>
        {sessions.length > 0 && (
          <span className="text-sm text-muted">
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
          </span>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card pad="p-4" className="text-center text-sm text-muted">No sessions yet today. Pick a subject and press Start. You&apos;ve got this! 💪</Card>
      ) : (
        <Card pad="px-4 py-1">
          <ul className="divide-y divide-line">
            {sessions.map((session) => {
              const badge = badgeFor(session, now);
              return (
                <li key={session.id} className="flex items-center gap-3 py-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: subjectColor(session.subject) }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{session.subject}</p>
                    <p className="text-sm text-muted">
                      {formatTime(session.startTime)}
                      {session.endTime ? ` – ${formatTime(session.endTime)}` : ''}
                      {session.mode === 'pomodoro' && ' · 🍅 Pomodoro'}
                    </p>
                  </div>
                  {badge && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}>{badge.label}</span>}
                  <span className="font-bold text-ink tabular-nums">{formatDuration(sessionMinutes(session, now))}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
