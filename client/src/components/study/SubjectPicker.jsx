// Tappable subject "chips". Exactly one is selected (like radio buttons).
export default function SubjectPicker({ subjects, value, onChange, disabled = false }) {
  return (
    <div role="radiogroup" aria-label="Subject" className="flex flex-wrap gap-2">
      {subjects.map((subject) => {
        const selected = subject.name === value;
        return (
          <button
            key={subject.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(subject.name)}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold transition disabled:opacity-60 ${
              selected
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {subject.name}
          </button>
        );
      })}
    </div>
  );
}
