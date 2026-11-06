// Mon–Sun bar chart (plain HTML, no chart library). Colours, as in the design:
//   goal reached → teal · below goal → light teal · today → orange (yellow in dark mode) · future → grey stub
// `compact` = the small version on the supporter's page (single letters, no numbers, no goal line).
import { shortHours } from '../../utils/week.js';

function barColor(day) {
  if (day.isToday) return 'bg-highlight';
  return day.hitGoal ? 'bg-accent' : 'bg-accent-soft';
}

export default function WeekBars({ days, goalMinutes, compact = false }) {
  const chartHeight = compact ? 72 : 150; // px
  const scaleMax = Math.max(goalMinutes || 0, ...days.map((d) => d.totalMinutes), 60) * 1.12;
  const toPx = (minutes) => Math.max(6, Math.round((minutes / scaleMax) * chartHeight));
  const goalPx = goalMinutes ? Math.round((goalMinutes / scaleMax) * chartHeight) : null;

  return (
    <figure aria-label="Study time per day this week">
      <div className="relative flex items-end gap-2 sm:gap-3" style={{ height: chartHeight + (compact ? 0 : 22) }}>
        {!compact && goalPx !== null && (
          <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-line" style={{ bottom: goalPx }} aria-hidden="true">
            <span className="absolute -top-5 right-0 text-xs font-medium text-muted">{shortHours(goalMinutes)} goal</span>
          </div>
        )}
        {days.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
            {!compact && !day.isFuture && day.totalMinutes > 0 && (
              // relative + bg: the label sits ON TOP of the dashed goal line instead of being crossed by it
              <span className={`relative mb-1 rounded bg-surface px-0.5 text-xs font-bold tabular-nums ${day.isToday ? 'text-highlight' : 'text-ink'}`}>
                {shortHours(day.totalMinutes)}
              </span>
            )}
            {day.isFuture || day.totalMinutes === 0 ? (
              <div className="h-1.5 w-full max-w-10 rounded-full bg-surface-2" title={`${day.label}: nothing yet`} />
            ) : (
              <div
                className={`w-full max-w-10 rounded-xl ${barColor(day)}`}
                style={{ height: toPx(day.totalMinutes) }}
                title={`${day.label}: ${shortHours(day.totalMinutes)}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {days.map((day) => (
          <span key={day.date} className={`flex-1 text-center text-sm ${day.isToday ? 'font-bold text-highlight' : 'text-muted'}`}>
            {compact ? day.label.charAt(0) : day.isToday ? 'Today' : day.label}
          </span>
        ))}
      </div>
      {/* Screen readers get the numbers as text */}
      <figcaption className="sr-only">
        {days.map((d) => `${d.label}: ${d.isFuture ? 'not yet' : shortHours(d.totalMinutes)}`).join(', ')}
      </figcaption>
    </figure>
  );
}
