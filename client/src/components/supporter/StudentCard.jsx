// One linked student on the supporter dashboard: avatar, live status, today vs goal.
// Tapping it opens the read-only detail view.
import { Link } from 'react-router-dom';
import { useLiveStudentStats } from '../../hooks/useLiveStudentStats.js';
import { formatDuration } from '../../utils/format.js';
import LiveStatusText from './LiveStatusText.jsx';
import Icon from '../ui/Icon.jsx';

export default function StudentCard({ student, serverTime, receivedAt }) {
  const { view, totalMinutes } = useLiveStudentStats(student, serverTime, receivedAt);
  const goal = student.dailyGoalMinutes;
  const progress = goal ? Math.min(totalMinutes / goal, 1) : 0;

  return (
    <Link
      to={`/supporter/students/${student.studentId}`}
      className="block rounded-3xl bg-surface p-4 shadow-sm shadow-black/[0.04] transition hover:ring-2 hover:ring-brand-line"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white" aria-hidden="true">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{student.name}</p>
          <LiveStatusText subject={student.activeSession?.subject} view={view} />
        </div>
        <Icon name="chevron" className="h-5 w-5 text-faint" />
      </div>

      <div className="mt-3 flex items-baseline justify-between text-sm">
        <span className="text-muted">
          Today <strong className="text-ink tabular-nums">{formatDuration(totalMinutes)}</strong>
          {goal > 0 && <> of {formatDuration(goal)}</>}
        </span>
        <span className="text-xs text-muted">{student.telegramConnected ? '📱 Telegram on' : 'Telegram off'}</span>
      </div>
      {goal > 0 && (
        <div className="mt-2 h-2 rounded-full bg-surface-2" aria-hidden="true">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </Link>
  );
}
