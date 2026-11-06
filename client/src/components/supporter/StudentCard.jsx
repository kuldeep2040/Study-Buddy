// One linked student on the supporter dashboard. Tapping it opens the read-only detail view.
import { Link } from 'react-router-dom';
import { useLiveStudentStats } from '../../hooks/useLiveStudentStats.js';
import { formatClock, formatDuration } from '../../utils/format.js';

export default function StudentCard({ student, serverTime, receivedAt }) {
  const { elapsedMs, totalMinutes } = useLiveStudentStats(student, serverTime, receivedAt);
  const active = student.activeSession;

  return (
    <Link
      to={`/supporter/students/${student.studentId}`}
      className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:ring-indigo-300"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-lg font-semibold text-slate-900">{student.name}</p>
        <span aria-hidden="true" className="text-slate-400">
          ›
        </span>
      </div>

      {active ? (
        <p className="mt-1 text-sm font-medium text-emerald-700">
          <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
          Studying {active.subject} · <span className="tabular-nums">{formatClock(elapsedMs)}</span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-500">Not studying right now</p>
      )}

      <p className="mt-3 flex items-center justify-between text-sm text-slate-600">
        <span>
          Today: <strong className="text-slate-900 tabular-nums">{formatDuration(totalMinutes)}</strong>
        </span>
        <span className="text-xs text-slate-500">{student.telegramConnected ? '📱 Telegram on' : 'Telegram off'}</span>
      </p>
    </Link>
  );
}
