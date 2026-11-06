// Shown after Stop: what he just did + where he stands for the day.
import { formatDuration } from '../../utils/format.js';

export default function SessionSummaryCard({ summary, onClose }) {
  const { session, todayTotalMinutes, dailyGoalMinutes } = summary;
  const percent = dailyGoalMinutes ? Math.round((todayTotalMinutes / dailyGoalMinutes) * 100) : 0;
  const autoStopped = session.status === 'auto-stopped';

  return (
    <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" role="status" data-testid="session-summary">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-emerald-900">
          {autoStopped ? '⏹️ Session reached the 4-hour limit' : percent >= 100 ? '🏆 Daily goal reached!' : '🎉 Nice work!'}
        </p>
        <button type="button" onClick={onClose} aria-label="Close summary" className="-mt-2 -mr-2 min-h-11 min-w-11 rounded-lg text-emerald-800 hover:bg-emerald-100">
          ✕
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <dt className="text-xs text-emerald-800">{session.subject}</dt>
          <dd className="text-xl font-bold text-emerald-950 tabular-nums">{formatDuration(session.durationMinutes)}</dd>
        </div>
        <div>
          <dt className="text-xs text-emerald-800">Today</dt>
          <dd className="text-xl font-bold text-emerald-950 tabular-nums">{formatDuration(todayTotalMinutes)}</dd>
        </div>
        <div>
          <dt className="text-xs text-emerald-800">Daily goal</dt>
          <dd className="text-xl font-bold text-emerald-950 tabular-nums">{percent}%</dd>
        </div>
      </dl>

      <div className="mt-3 h-2 rounded-full bg-emerald-200" role="progressbar" aria-valuenow={Math.min(percent, 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Daily goal progress">
        <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      <p className="mt-2 text-sm text-emerald-800">
        {percent >= 100
          ? `You studied ${formatDuration(todayTotalMinutes)} of your ${formatDuration(dailyGoalMinutes)} goal. Amazing!`
          : `${formatDuration(dailyGoalMinutes - todayTotalMinutes)} to go to reach today's ${formatDuration(dailyGoalMinutes)} goal.`}
      </p>
    </div>
  );
}
