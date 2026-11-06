// "Daily goal" card: a ring showing today's time vs the goal, plus an encouraging line.
// Kept compact so the Start button fits on the same phone screen.
// Wording is always positive (core principle: encourage, never shame).
import { formatDuration } from '../../utils/format.js';
import Card from '../ui/Card.jsx';
import ProgressRing from '../ui/ProgressRing.jsx';

function encouragement(progress) {
  if (progress >= 1) return 'Goal reached! Amazing work today. 🏆';
  if (progress >= 0.5) return 'Past halfway. One more focused block keeps you on track.';
  if (progress >= 0.25) return 'Building momentum. Keep it going!';
  if (progress > 0) return 'Good start! Every minute counts.';
  return 'Fresh day, fresh start. Pick a subject and begin.';
}

export default function GoalCard({ totalMinutes, goalMinutes }) {
  const progress = goalMinutes ? totalMinutes / goalMinutes : 0;
  const left = Math.max(0, goalMinutes - totalMinutes);

  return (
    <Card pad="p-4" className="flex items-center gap-4" data-testid="goal-card">
      <ProgressRing value={progress} size={92} stroke={9} label="Daily goal progress">
        <span className="text-lg leading-tight font-bold tracking-tight text-ink tabular-nums">{formatDuration(totalMinutes)}</span>
        <span className="text-xs text-muted">of {formatDuration(goalMinutes)}</span>
      </ProgressRing>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">Daily goal</p>
        <p className="mt-0.5 leading-snug font-bold text-ink">{encouragement(progress)}</p>
        {left > 0 && <p className="mt-1 text-sm font-semibold text-success">{formatDuration(left)} to go</p>}
      </div>
    </Card>
  );
}
