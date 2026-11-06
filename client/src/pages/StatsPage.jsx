// Student Stats (matches the design): this week's total vs last week, daily bars with the goal
// line, tiles, by-subject breakdown — then the full day-by-day History underneath.
// Built from the history API (data we already record). Streaks and Month/Year are "coming soon".
import { useMemo, useState } from 'react';
import { getMyHistory } from '../api/history.js';
import { getSettings } from '../api/settings.js';
import { usePolledData } from '../hooks/usePolledData.js';
import { useWeekHistory } from '../hooks/useWeekHistory.js';
import { getErrorMessage } from '../api/client.js';
import { formatDuration, todayIst } from '../utils/format.js';
import { buildWeekStats } from '../utils/week.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Icon from '../components/ui/Icon.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import WeekBars from '../components/stats/WeekBars.jsx';
import StatTile from '../components/stats/StatTile.jsx';
import SubjectBreakdown from '../components/stats/SubjectBreakdown.jsx';
import HistoryList from '../components/history/HistoryList.jsx';

const RANGES = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month', soon: true }
];

/** "↑ 2h 10m more than this point last week" — always encouraging, never shaming. */
function Comparison({ thisWeek, lastWeek }) {
  if (thisWeek === 0 && lastWeek === 0) return <p className="mt-1 text-sm text-muted">Your week starts with your first session. 🚀</p>;
  if (lastWeek === 0) return <p className="mt-1 text-sm font-semibold text-success">↑ More than this point last week. Great start!</p>;
  const diff = thisWeek - lastWeek;
  if (Math.abs(diff) < 1) return <p className="mt-1 text-sm font-semibold text-success">Same pace as last week. Steady! 👏</p>;
  return diff > 0 ? (
    <p className="mt-1 text-sm font-semibold text-success">↑ {formatDuration(diff)} more than this point last week</p>
  ) : (
    <p className="mt-1 text-sm text-muted">{formatDuration(-diff)} behind last week&apos;s pace. One good session catches up! 💪</p>
  );
}

export default function StatsPage() {
  const [range, setRange] = useState('week');
  const history = useWeekHistory(getMyHistory);
  const settings = usePolledData(getSettings, { intervalMs: 300000 });
  const goalMinutes = settings.data?.dailyGoalMinutes ?? 0;

  const week = useMemo(
    () => (history.data ? buildWeekStats(history.data.days, { today: todayIst(), goalMinutes }) : null),
    [history.data, goalMinutes],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Stats</h1>
        {week && <span className="text-sm font-medium text-muted">{week.rangeLabel}</span>}
      </div>
      <SegmentedControl label="Range" options={RANGES} value={range} onChange={setRange} size="sm" />

      {(history.status === 'loading' || (history.status === 'ready' && !settings.data)) && (
        <Card className="flex items-center justify-center gap-3 py-12 text-muted">
          <Spinner className="h-5 w-5 text-accent" /> Loading your week…
        </Card>
      )}
      {history.status === 'error' && (
        <Card className="space-y-3 text-center">
          <p className="text-ink-soft">{getErrorMessage(history.error)}</p>
          <Button onClick={history.refresh}>Try again</Button>
        </Card>
      )}

      {week && settings.data && (
        <>
          <Card data-testid="week-card">
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">Studied this week</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-ink tabular-nums">{formatDuration(week.totalMinutes)}</p>
            <Comparison thisWeek={week.totalMinutes} lastWeek={week.lastWeekSoFar} />
            <div className="mt-5">
              <WeekBars days={week.days} goalMinutes={goalMinutes} />
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Current streak" soon />
            <StatTile label="Best streak" soon />
            <StatTile label="Daily average" value={formatDuration(week.dailyAverage)} />
            <StatTile label="Goal hit" value={week.goalHitDays} unit={`of ${week.elapsedDays} ${week.elapsedDays === 1 ? 'day' : 'days'}`} />
          </div>

          <SubjectBreakdown subjects={week.subjects} />

          <p className="flex gap-2 px-1 text-sm text-muted">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Your supporters can see these numbers and your history (read-only). A weekly Telegram summary is coming soon.</span>
          </p>
        </>
      )}

      <section className="space-y-3 pt-2" aria-label="History">
        <h2 className="px-1 text-lg font-bold text-ink">History</h2>
        {/* getMyHistory is a stable module function, so HistoryList won't reload in a loop */}
        <HistoryList fetchPage={getMyHistory} emptyText="No sessions yet. Your history starts with your first Start! 🚀" />
      </section>
    </div>
  );
}
