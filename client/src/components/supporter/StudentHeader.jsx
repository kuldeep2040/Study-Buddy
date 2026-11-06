// "R  Rahul's progress / You're their supporter" + a live "Studying Physics · 0:25:09" pill.
import { useLiveStudentStats } from '../../hooks/useLiveStudentStats.js';
import { formatClock } from '../../utils/format.js';

export default function StudentHeader({ student, serverTime, receivedAt }) {
  const { elapsedMs } = useLiveStudentStats(student, serverTime, receivedAt);
  const active = student.activeSession;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white" aria-hidden="true">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-ink">{student.name}&apos;s progress</h1>
          <p className="text-sm text-muted">You&apos;re their supporter · read-only</p>
        </div>
      </div>
      {active ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-sm font-semibold text-success" data-testid="status-pill">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" aria-hidden="true" />
          Studying {active.subject} · <span className="tabular-nums" role="timer">{formatClock(elapsedMs)}</span>
        </p>
      ) : (
        <p className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold text-ink-soft" data-testid="status-pill">
          <span className="h-2 w-2 rounded-full bg-faint" aria-hidden="true" />
          Not studying right now
        </p>
      )}
    </div>
  );
}
