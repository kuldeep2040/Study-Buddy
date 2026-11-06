// "This week" maths for the Stats page and the supporter view. Pure functions (no React).
// Weeks run Monday → Sunday, in India time. Input: days from the history API,
// [{ date: 'YYYY-MM-DD', totalMinutes, subjects: [{ subject, minutes }] }] (only days WITH study).

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** '2026-11-06' + 3 → '2026-11-09' (calendar maths in UTC, so time zones can't interfere). */
export function addDays(date, days) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** The Monday of the week containing `date`. */
export function mondayOf(date) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0 = Sunday … 6 = Saturday
  return addDays(date, -((weekday + 6) % 7));
}

const dayMonth = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const dayOnly = new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: 'UTC' });

/** "2 – 8 Nov", or "27 Oct – 2 Nov" when the week spans two months. */
export function weekRangeLabel(monday) {
  const sunday = addDays(monday, 6);
  const start = new Date(`${monday}T12:00:00Z`);
  const end = new Date(`${sunday}T12:00:00Z`);
  const sameMonth = monday.slice(0, 7) === sunday.slice(0, 7);
  return `${(sameMonth ? dayOnly : dayMonth).format(start)} – ${dayMonth.format(end)}`;
}

/** Minutes → "5.5h", "6h", "45m" (short labels above chart bars). */
export function shortHours(minutes) {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  return `${Number((minutes / 60).toFixed(1))}h`;
}

/**
 * Everything the week view shows. `today` = IST 'YYYY-MM-DD'.
 * Comparisons with last week use the SAME days so far (Mon → today's weekday), so a Tuesday isn't
 * compared with a whole week — fairer, and less discouraging early in the week.
 */
export function buildWeekStats(historyDays, { today, goalMinutes }) {
  const monday = mondayOf(today);
  const minutesOn = new Map(historyDays.map((day) => [day.date, day.totalMinutes]));
  const todayIndex = DAY_LABELS.findIndex((_, i) => addDays(monday, i) === today);

  const days = DAY_LABELS.map((label, i) => {
    const date = addDays(monday, i);
    const totalMinutes = minutesOn.get(date) ?? 0;
    return {
      date,
      label,
      totalMinutes,
      isToday: i === todayIndex,
      isFuture: i > todayIndex,
      hitGoal: goalMinutes > 0 && totalMinutes >= goalMinutes,
    };
  });

  const elapsed = days.filter((d) => !d.isFuture);
  const totalMinutes = elapsed.reduce((sum, d) => sum + d.totalMinutes, 0);
  const lastWeekSoFar = DAY_LABELS.slice(0, todayIndex + 1).reduce((sum, _, i) => sum + (minutesOn.get(addDays(monday, i - 7)) ?? 0), 0);

  // Subjects this week, biggest first, with their share of the week.
  const subjectTotals = new Map();
  for (const day of historyDays) {
    if (day.date < monday || day.date > today) continue;
    for (const s of day.subjects) subjectTotals.set(s.subject, (subjectTotals.get(s.subject) ?? 0) + s.minutes);
  }
  const subjects = [...subjectTotals]
    .map(([subject, minutes]) => ({ subject, minutes, percent: totalMinutes ? Math.round((minutes / totalMinutes) * 100) : 0 }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    monday,
    rangeLabel: weekRangeLabel(monday),
    days,
    totalMinutes,
    lastWeekSoFar,
    elapsedDays: elapsed.length,
    dailyAverage: elapsed.length ? totalMinutes / elapsed.length : 0,
    goalHitDays: elapsed.filter((d) => d.hitGoal).length,
    subjects,
  };
}
