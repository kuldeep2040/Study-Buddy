// A pill-shaped switch with 2–3 options ("Week | Month | Year", "Normal timer | Pomodoro").
// Options marked `soon` can't be picked and say "soon" (feature not built yet).
// size="sm" is the slim version used on the home screen.
export default function SegmentedControl({ label, options, value, onChange, size = 'md', className = '' }) {
  const small = size === 'sm';
  return (
    <div role="radiogroup" aria-label={label} className={`flex rounded-full bg-surface-2 p-1 ${className}`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.soon}
            title={option.soon ? 'Coming soon' : undefined}
            onClick={() => onChange?.(option.value)}
            className={`flex flex-1 items-center justify-center rounded-full font-semibold transition
              ${small ? 'min-h-9 gap-1 px-3 text-xs' : 'min-h-11 flex-col px-4 text-sm'}
              ${selected ? 'bg-surface text-ink shadow-sm' : 'text-muted'} ${option.soon ? 'cursor-not-allowed' : 'hover:text-ink'}`}
          >
            <span>{option.label}</span>
            {option.soon && (
              <span className={small ? 'font-medium text-faint' : '-mt-0.5 text-[10px] font-medium text-faint'}>
                {small ? '· soon' : 'coming soon'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
