// Add, rename and delete subjects. Opened from "Edit subjects" on the home screen.
import { useState } from 'react';
import { getErrorMessage } from '../../api/client.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import SubjectRow from './SubjectRow.jsx';

export default function SubjectEditor({ subjectsState, onClose }) {
  const { subjects, add, rename, remove } = subjectsState;
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(event) {
    event.preventDefault();
    setAdding(true);
    setError('');
    try {
      await add(newName);
      setNewName('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card>
      <div className="flex min-h-11 items-center justify-between">
        <h2 className="font-semibold text-slate-900">Your subjects</h2>
        {/* On the home screen it's a pop-open panel with "Done"; in Settings it's always open. */}
        {onClose && (
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Done
          </button>
        )}
      </div>

      <ul className="mt-2 divide-y divide-slate-100">
        {subjects.map((subject) => (
          <SubjectRow
            key={subject.id}
            subject={subject}
            onRename={rename}
            onDelete={remove}
            canDelete={subjects.length > 1}
          />
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-3 flex gap-2 border-t border-slate-100 pt-4">
        <input
          aria-label="New subject name"
          placeholder="Add a subject, e.g. Biology"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={30}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3.5 text-base placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <Button type="submit" loading={adding} disabled={!newName.trim()}>
          Add
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </Card>
  );
}
