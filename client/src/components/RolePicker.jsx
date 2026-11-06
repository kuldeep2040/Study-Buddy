// Two big tappable cards: "I'm a student" / "I'm a supporter". Works like radio buttons.
const ROLE_OPTIONS = [
  {
    value: 'student',
    emoji: '🎓',
    title: "I'm a student",
    description: 'Track your study time, stay focused and see your progress.',
  },
  {
    value: 'supporter',
    emoji: '🤝',
    title: "I'm a supporter",
    description: 'Encourage a student. You get read-only updates they choose to share.',
  },
];

export default function RolePicker({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-ink-soft">Who are you?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer gap-3 rounded-2xl p-4 ring-2 transition ${
                selected ? 'bg-brand-soft ring-accent' : 'bg-surface ring-line hover:ring-line'
              }`}
            >
              {/* The real radio input is visually hidden but still works with keyboard + screen readers */}
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="text-2xl" aria-hidden="true">
                {option.emoji}
              </span>
              <span>
                <span className="block font-semibold text-ink">{option.title}</span>
                <span className="block text-sm text-muted">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </fieldset>
  );
}
