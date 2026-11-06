// "By subject": one stacked bar + a row per subject (colour dot, time, % of the week).
import { formatDuration } from '../../utils/format.js';
import { subjectColor } from '../../utils/subjectColors.js';
import Card from '../ui/Card.jsx';

export default function SubjectBreakdown({ subjects }) {
  return (
    <Card>
      <h2 className="text-lg font-bold text-ink">By subject</h2>
      {subjects.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No study time yet this week. Your subjects will show up here.</p>
      ) : (
        <>
          <div className="mt-4 flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden="true">
            {subjects.map((s) => (
              <div key={s.subject} style={{ flexGrow: s.minutes, backgroundColor: subjectColor(s.subject) }} />
            ))}
          </div>
          <ul className="mt-3 divide-y divide-line">
            {subjects.map((s) => (
              <li key={s.subject} className="flex items-center gap-3 py-2.5">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: subjectColor(s.subject) }} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{s.subject}</span>
                <span className="font-bold text-ink tabular-nums">{formatDuration(s.minutes)}</span>
                <span className="w-10 text-right text-sm text-muted tabular-nums">{s.percent}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
