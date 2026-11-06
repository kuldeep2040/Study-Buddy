// A labelled input with an optional hint and error message underneath.
import { useId } from 'react';

export default function TextField({ label, error, hint, className = '', ...inputProps }) {
  const id = useId(); // unique id so <label> is connected to its <input> (accessibility)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`block min-h-11 w-full rounded-xl border bg-white px-3.5 text-base text-slate-900 shadow-sm
          placeholder:text-slate-400 focus:outline-none focus:ring-2
          ${error ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'}`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
