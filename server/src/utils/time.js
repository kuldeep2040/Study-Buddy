// Time helpers. We STORE everything in UTC, but "today" and displayed times use India time (IST).
// IST is always UTC+05:30 — India has no daylight saving — so a fixed offset is safe.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The IST calendar date of an instant, as 'YYYY-MM-DD'. E.g. 2026-11-05T20:00Z → '2026-11-06'. */
export function toIstDateString(date = new Date()) {
  // Shift the instant forward by 5h30m, then read the UTC date — that's the date in India.
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * The start and end (as UTC Date objects) of the IST day containing `date`.
 * E.g. for any time on 6 Nov in India → { start: 2026-11-05T18:30:00Z, end: 2026-11-06T18:30:00Z }.
 * Use it in queries like: { startTime: { $gte: start, $lt: end } }
 */
export function getIstDayRange(date = new Date()) {
  const start = new Date(`${toIstDateString(date)}T00:00:00+05:30`);
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

/** 'YYYY-MM-DD' (an IST calendar day) → the UTC instant when that day starts in India. */
export function istDayStart(dateString) {
  return new Date(`${dateString}T00:00:00+05:30`);
}

/** '2026-11-06' + 3 → '2026-11-09' (pure calendar maths, no time zones involved). */
export function addDays(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both 'YYYY-MM-DD'). '2026-11-06' → '2026-11-09' = 3. */
export function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

const istTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/** A human-friendly IST time, e.g. "4:05 pm". Used in Telegram messages. */
export function formatIstTime(date) {
  return istTimeFormatter.format(date);
}
