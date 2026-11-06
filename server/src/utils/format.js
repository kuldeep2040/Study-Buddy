/** Minutes → "1h 25m" (or "25m" under an hour). Rounded to the nearest whole minute. */
export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/** Minutes → always "Xh Ym", e.g. "0h 25m", "2h 05m" style used for daily totals. */
export function formatHoursMinutes(minutes) {
  const total = Math.max(0, Math.round(minutes || 0));
  return `${Math.floor(total / 60)}h ${total % 60}m`;
}
