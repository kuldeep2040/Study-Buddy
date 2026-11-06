// "R  Rahul's progress / You're their supporter" + a live status pill (studying / paused / on a break).
import { useLiveStudentStats } from '../../hooks/useLiveStudentStats.js';
import LiveStatusText from './LiveStatusText.jsx';

export default function StudentHeader({ student, serverTime, receivedAt }) {
  const { view } = useLiveStudentStats(student, serverTime, receivedAt);

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
      <LiveStatusText subject={student.activeSession?.subject} view={view} pill />
    </div>
  );
}
