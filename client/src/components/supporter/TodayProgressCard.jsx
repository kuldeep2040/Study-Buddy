// Supporter view "TODAY" card: live total vs the student's daily goal, progress bar, last session.
import { useLiveStudentStats } from '../../hooks/useLiveStudentStats.js';
import { formatDuration, formatTime } from '../../utils/format.js';
import { subjectColor } from '../../utils/subjectColors.js';
import Card from '../ui/Card.jsx';

export default function TodayProgressCard({ student, serverTime, receivedAt }) {
  const { totalMinutes } = useLiveStudentStats(student, serverTime, receivedAt);
  const goal = student.dailyGoalMinutes;
  const progress = goal ? Math.min(totalMinutes / goal, 1) : 0;
  const left = Math.max(0, goal - totalMinutes);
  const last = student.lastSession;

  return (
    <Card data-testid="today-progress">
      <p className="text-xs font-semibold tracking-wider text-muted uppercase">Today</p>
      <p className="mt-1">
        <span className="text-3xl font-bold tracking-tight text-ink tabular-nums">{formatDuration(totalMinutes)}</span>
        {goal > 0 && <span className="ml-2 text-sm text-muted">of {formatDuration(goal)} goal</span>}
      </p>

      {goal > 0 && (
        <>
          <div className="mt-3 h-2 rounded-full bg-surface-2" role="progressbar" aria-label="Daily goal progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <div className="h-2 rounded-full bg-accent transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-success">{left > 0 ? `${formatDuration(left)} to go` : 'Goal reached today! 🏆'}</p>
            <span className="rounded-full bg-highlight-soft px-2.5 py-1 text-xs font-semibold text-highlight">
              🔥 Streaks <span className="font-medium opacity-75">· coming soon</span>
            </span>
          </div>
        </>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
        {last ? (
          <>
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: subjectColor(last.subject) }} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">Last session</p>
              <p className="truncate font-semibold text-ink">
                {last.subject} · {formatTime(last.startTime)} – {formatTime(last.endTime)}
              </p>
            </div>
            <span className="font-bold text-ink tabular-nums">{formatDuration(last.durationMinutes)}</span>
          </>
        ) : (
          <p className="text-sm text-muted">No finished sessions yet today.</p>
        )}
      </div>
    </Card>
  );
}
