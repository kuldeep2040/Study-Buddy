// Tappable subject chips with a colour dot, in one row that scrolls sideways on small phones.
// Exactly one is selected (like radio buttons). The last chip opens the subject editor.
import { subjectColor } from '../../utils/subjectColors.js';

export default function SubjectPicker({ subjects, value, onChange, onEdit, disabled = false }) {
  return (
    // -mx-4 px-4: the row can scroll to the screen edge while lining up with the cards
    <div role="radiogroup" aria-label="Subject" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
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
            className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition disabled:opacity-60 ${
              selected ? 'bg-brand text-white shadow-sm' : 'bg-surface text-ink ring-1 ring-line hover:bg-surface-2'
            }`}
          >
            {!selected && (
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subjectColor(subject.name) }} aria-hidden="true" />
            )}
            {subject.name}
          </button>
        );
      })}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap text-accent ring-1 ring-line ring-inset hover:bg-surface-2 disabled:opacity-60"
        >
          Edit subjects
        </button>
      )}
    </div>
  );
}
