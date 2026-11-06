// A circular progress ring (SVG). `value` is 0–1; the ring starts at 12 o'clock.
// How it works: a circle's outline is drawn as a dash; we make the dash as long as the progress
// and the gap as long as the rest (stroke-dasharray), so only part of the ring is coloured.
// tone: 'accent' (focus / goal), 'highlight' (Pomodoro break), 'muted' (paused).
const TONES = { accent: 'stroke-accent', highlight: 'stroke-highlight', muted: 'stroke-faint' };

export default function ProgressRing({ value, size = 132, stroke = 12, tone = 'accent', children, label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 1);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-surface-2" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`${TONES[tone]} transition-[stroke-dasharray] duration-700`}
          strokeDasharray={`${progress * circumference} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
