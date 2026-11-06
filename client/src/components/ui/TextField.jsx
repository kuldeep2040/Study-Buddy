// A labelled input with an optional hint and error message underneath.
import { useId } from 'react';

export default function TextField({ label, error, hint, className = '', ...inputProps }) {
  const id = useId(); // unique id so <label> is connected to its <input> (accessibility)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`block min-h-11 w-full rounded-xl border bg-surface px-3.5 text-base text-ink shadow-sm
          placeholder:text-faint focus:outline-none focus:ring-2
          ${error ? 'border-danger focus:ring-danger-line' : 'border-line focus:border-accent focus:ring-brand-line'}`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
