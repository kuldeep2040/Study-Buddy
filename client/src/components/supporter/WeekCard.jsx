// Supporter view "This week": total + small Mon–Sun bars + how many days hit the goal.
import { formatDuration } from '../../utils/format.js';
import Card from '../ui/Card.jsx';
import WeekBars from '../stats/WeekBars.jsx';

export default function WeekCard({ week, goalMinutes }) {
  return (
    <Card data-testid="week-card">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-ink">This week</h2>
        <span className="font-bold text-ink tabular-nums">{formatDuration(week.totalMinutes)}</span>
      </div>
      <WeekBars days={week.days} goalMinutes={goalMinutes} compact />
      {goalMinutes > 0 && (
        <p className="mt-3 text-sm text-muted">
          Hit the {formatDuration(goalMinutes)} goal on {week.goalHitDays} of {week.elapsedDays} {week.elapsedDays === 1 ? 'day' : 'days'} so far.
        </p>
      )}
    </Card>
  );
}
