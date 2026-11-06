// Pure display helpers (no React). Times are shown in India time (Asia/Kolkata).

/** Must match AUTO_STOP_HOURS on the server. Only used for UI hints. */
export const AUTO_STOP_HOURS = 4;

/** Milliseconds → stopwatch text: "0:25:09", "1:05:00". */
export function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

/** Minutes → "1h 25m", "25m", "<1m" (for a few seconds), "0m". */
export function formatDuration(minutes) {
  if (minutes > 0 && minutes < 1) return '<1m';
  const total = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/** ISO date string or Date → "4:05 pm" (India time). */
export function formatTime(value) {
  return timeFormatter.format(new Date(value));
}

// 'en-CA' formats dates as YYYY-MM-DD, which is exactly the shape the server uses.
const istDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });

/** ISO date string or Date → its calendar day in India, e.g. "2026-11-06". */
export function istDateString(value) {
  return istDateFormatter.format(new Date(value));
}

/** Today's date in India, 'YYYY-MM-DD'. */
export function todayIst() {
  return istDateString(new Date());
}

/** Calendar days from today (India) until 'YYYY-MM-DD'. Tomorrow = 1, today = 0, past = negative. */
export function daysUntil(dateString) {
  return Math.round((Date.parse(`${dateString}T00:00:00Z`) - Date.parse(`${todayIst()}T00:00:00Z`)) / 86400000);
}

/** "Good morning/afternoon/evening", based on the hour in India. */
export function greetingForNow(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hourCycle: 'h23' }).format(now));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
