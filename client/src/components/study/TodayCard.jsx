// Today's total study time + the list of today's sessions.
import { useNow } from '../../hooks/useNow.js';
import { formatDuration, formatTime } from '../../utils/format.js';
import Card from '../ui/Card.jsx';

/** Minutes for one session: finished → its saved duration; running → time so far. */
function sessionMinutes(session, nowMs) {
  if (session.status === 'active') return Math.max(0, nowMs - Date.parse(session.startTime)) / 60000;
  return session.durationMinutes || 0;
}

function encouragement(totalMinutes, sessionCount) {
  if (sessionCount === 0) return "No sessions yet today. Pick a subject and press Start. You've got this! 💪";
  if (totalMinutes < 60) return 'Good start! Every minute counts. 🌱';
  if (totalMinutes < 180) return 'Great focus today! Keep it going. 🚀';
  return 'Amazing effort today! 🏆';
}

const STATUS_BADGE = {
  active: { label: 'In progress', className: 'bg-emerald-100 text-emerald-800' },
  'auto-stopped': { label: 'Auto-stopped', className: 'bg-amber-100 text-amber-800' },
};

export default function TodayCard({ sessions, clockOffsetMs }) {
  const hasRunning = sessions.some((s) => s.status === 'active');
  // Only tick while something is running (the total grows); 10s is enough for "1h 25m" precision.
  const now = useNow(10000, hasRunning) + clockOffsetMs;
  const totalMinutes = sessions.reduce((sum, s) => sum + sessionMinutes(s, now), 0);

  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">Today</p>
      <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
        {formatDuration(totalMinutes)}
      </p>
      <p className="mt-1 text-sm text-slate-600">{encouragement(totalMinutes, sessions.length)}</p>

      {sessions.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {sessions.map((session) => {
            const badge = STATUS_BADGE[session.status];
            return (
              <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{session.subject}</p>
                  <p className="text-sm text-slate-500">
                    {formatTime(session.startTime)}
                    {session.endTime ? ` – ${formatTime(session.endTime)}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {badge && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                  )}
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {formatDuration(sessionMinutes(session, now))}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
