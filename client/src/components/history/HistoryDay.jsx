// One day in the history: date, total, subjects. Tap to see that day's sessions.
import { useState } from 'react';
import { formatDuration, formatTime, todayIst } from '../../utils/format.js';
import { subjectColor } from '../../utils/subjectColors.js';

const dayFormatter = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' });

function dayLabel(date) {
  const today = todayIst();
  const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 864e5).toISOString().slice(0, 10);
  if (date === today) return 'Today';
  if (date === yesterday) return 'Yesterday';
  return dayFormatter.format(new Date(`${date}T12:00:00+05:30`)); // e.g. "Mon, 3 Nov"
}

export default function HistoryDay({ day }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-3xl bg-surface shadow-sm shadow-black/[0.04]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{dayLabel(day.date)}</p>
          <p className="mt-1 flex flex-wrap gap-1.5">
            {day.subjects.map((s) => (
              <span key={s.subject} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-ink-soft">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subjectColor(s.subject) }} aria-hidden="true" />
                {s.subject} {formatDuration(s.minutes)}
              </span>
            ))}
          </p>
        </div>
        <span className="font-bold text-ink tabular-nums">{formatDuration(day.totalMinutes)}</span>
        <span aria-hidden="true" className={`mt-1 text-faint transition ${open ? 'rotate-90' : ''}`}>
          ›
        </span>
      </button>

      {open && (
        <ul className="divide-y divide-line border-t border-line px-4">
          {day.sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate text-ink">{session.subject}</span>
              <span className="text-muted">
                {formatTime(session.startTime)}
                {session.endTime ? ` – ${formatTime(session.endTime)}` : ' (in progress)'}
                {session.status === 'auto-stopped' && ' · auto-stopped'}
              </span>
              <span className="font-semibold text-ink-soft tabular-nums">{formatDuration(session.durationMinutes)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
