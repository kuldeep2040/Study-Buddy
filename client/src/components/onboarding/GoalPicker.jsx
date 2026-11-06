// Daily study goal: quick presets + fine-tune in 15-minute steps. Value is in minutes.
import { formatDuration } from '../../utils/format.js';

const PRESETS = [120, 180, 240, 300, 360, 480];
const MIN = 15;
const MAX = 960;
const STEP = 15;

export default function GoalPicker({ value, onChange }) {
  const clamp = (minutes) => Math.min(MAX, Math.max(MIN, minutes));
  const stepButton =
    'flex h-11 w-11 items-center justify-center rounded-full bg-surface text-xl font-semibold text-ink-soft ring-1 ring-line hover:bg-surface-2 disabled:opacity-40';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4">
        <button type="button" aria-label="15 minutes less" className={stepButton} disabled={value <= MIN} onClick={() => onChange(clamp(value - STEP))}>
          −
        </button>
        <p className="w-28 text-center text-2xl font-bold tabular-nums" aria-live="polite">
          {formatDuration(value)}
        </p>
        <button type="button" aria-label="15 minutes more" className={stepButton} disabled={value >= MAX} onClick={() => onChange(clamp(value + STEP))}>
          +
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            aria-pressed={value === minutes}
            onClick={() => onChange(minutes)}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
              value === minutes ? 'bg-brand text-white' : 'bg-surface text-ink-soft ring-1 ring-line hover:bg-surface-2'
            }`}
          >
            {formatDuration(minutes)}
          </button>
        ))}
      </div>
    </div>
  );
}
