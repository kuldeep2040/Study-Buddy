// Compact subject editor for onboarding: chips with ×, plus "add". (Renaming lives in Settings.)
import { useState } from 'react';
import { getErrorMessage } from '../../api/client.js';
import Button from '../ui/Button.jsx';

export default function SubjectChipsEditor({ subjectsState }) {
  const { subjects, add, remove } = subjectsState;
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-2" aria-label="Your subjects">
        {subjects.map((subject) => (
          <li key={subject.id} className="flex min-h-11 items-center gap-1 rounded-full bg-brand-soft pr-1 pl-4 text-sm font-semibold text-accent ring-1 ring-brand-line">
            {subject.name}
            <button
              type="button"
              aria-label={`Remove ${subject.name}`}
              disabled={busy || subjects.length <= 1}
              onClick={() => run(() => remove(subject.id))}
              className="flex h-9 w-9 items-center justify-center rounded-full text-accent hover:bg-brand-soft disabled:opacity-30"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            await add(newName);
            setNewName('');
          });
        }}
      >
        <input
          aria-label="New subject name"
          placeholder="Add a subject, e.g. Biology"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={30}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-line px-3.5 text-base placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-brand-line focus:outline-none"
        />
        <Button type="submit" variant="secondary" loading={busy} disabled={!newName.trim()}>
          Add
        </Button>
      </form>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
