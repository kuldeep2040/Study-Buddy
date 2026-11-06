// Study history grouped by IST calendar day. The SAME function serves the student's own History
// page and a linked supporter's view, so both always see exactly the same thing.
import { Session } from '../models/Session.js';
import { env } from '../config/env.js';
import { addDays, istDayStart, toIstDateString } from '../utils/time.js';

const MAX_SESSION_MINUTES = env.AUTO_STOP_HOURS * 60;

/** Only the fields history needs — never the raw document. */
function toSessionView(session, now) {
  const runningMinutes = Math.min((now - session.startTime) / 60000, MAX_SESSION_MINUTES);
  return {
    id: session._id.toString(),
    subject: session.subject,
    startTime: session.startTime,
    endTime: session.endTime,
    durationMinutes: session.status === 'active' ? runningMinutes : session.durationMinutes || 0,
    status: session.status,
  };
}

/**
 * Days that have study sessions, newest first, in the window [before − days, before).
 * `before` defaults to tomorrow (so today is included). Pass the returned `nextBefore` to get older days.
 *
 * → { days: [{ date, totalMinutes, subjects: [{ subject, minutes }], sessions: [...] }],
 *     range: { from, to }, nextBefore: 'YYYY-MM-DD' | null }
 */
export async function getHistory(studentId, { days = 14, before } = {}, now = new Date()) {
  const windowEnd = before ?? addDays(toIstDateString(now), 1);
  const windowStart = addDays(windowEnd, -days);

  const [sessions, hasOlder] = await Promise.all([
    Session.find({
      userId: studentId,
      startTime: { $gte: istDayStart(windowStart), $lt: istDayStart(windowEnd) },
    })
      .sort({ startTime: -1 })
      .lean(),
    Session.exists({ userId: studentId, startTime: { $lt: istDayStart(windowStart) } }),
  ]);

  // Group sessions by the IST day they STARTED on (same rule as "today").
  const byDate = new Map();
  for (const raw of sessions) {
    const session = toSessionView(raw, now);
    const date = toIstDateString(raw.startTime);
    if (!byDate.has(date)) byDate.set(date, { date, totalMinutes: 0, subjectMinutes: new Map(), sessions: [] });
    const day = byDate.get(date);
    day.totalMinutes += session.durationMinutes;
    day.subjectMinutes.set(session.subject, (day.subjectMinutes.get(session.subject) || 0) + session.durationMinutes);
    day.sessions.push(session);
  }

  const dayList = [...byDate.values()].map(({ subjectMinutes, ...day }) => ({
    ...day,
    subjects: [...subjectMinutes]
      .map(([subject, minutes]) => ({ subject, minutes }))
      .sort((a, b) => b.minutes - a.minutes), // most-studied subject first
  }));

  return {
    days: dayList, // already newest first, because sessions were sorted that way
    range: { from: windowStart, to: addDays(windowEnd, -1) },
    nextBefore: hasOlder ? windowStart : null,
  };
}
