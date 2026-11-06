// One day in the history: date, total, subjects. Tap to see that day's sessions.
import { useState } from 'react';
import { formatDuration, formatTime, todayIst } from '../../utils/format.js';

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
    <article className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{dayLabel(day.date)}</p>
          <p className="mt-1 flex flex-wrap gap-1.5">
            {day.subjects.map((s) => (
              <span key={s.subject} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {s.subject} {formatDuration(s.minutes)}
              </span>
            ))}
          </p>
        </div>
        <span className="text-lg font-bold text-slate-900 tabular-nums">{formatDuration(day.totalMinutes)}</span>
        <span aria-hidden="true" className={`mt-1 text-slate-400 transition ${open ? 'rotate-90' : ''}`}>
          ›
        </span>
      </button>

      {open && (
        <ul className="divide-y divide-slate-100 border-t border-slate-100 px-4">
          {day.sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate text-slate-800">{session.subject}</span>
              <span className="text-slate-500">
                {formatTime(session.startTime)}
                {session.endTime ? ` – ${formatTime(session.endTime)}` : ' (in progress)'}
                {session.status === 'auto-stopped' && ' · auto-stopped'}
              </span>
              <span className="font-semibold text-slate-700 tabular-nums">{formatDuration(session.durationMinutes)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
