// One subject in the editor: shows its name, or an inline rename box.
import { useState } from 'react';
import { getErrorMessage } from '../../api/client.js';

export default function SubjectRow({ subject, onRename, onDelete, canDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(subject.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();
    if (name.trim() === subject.name) return setEditing(false);
    setSaving(true);
    setError('');
    try {
      await onRename(subject.id, name);
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    // window.confirm = the browser's built-in "OK / Cancel" dialog. Simple and works well on phones.
    if (!window.confirm(`Delete "${subject.name}"? Past sessions keep their subject name.`)) return;
    setError('');
    try {
      await onDelete(subject.id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const smallButton = 'min-h-11 rounded-lg px-3 text-sm font-medium disabled:opacity-60';

  return (
    <li className="py-2">
      {editing ? (
        <form onSubmit={save} className="flex gap-2">
          <input
            aria-label={`New name for ${subject.name}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            autoFocus
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button type="submit" disabled={saving} className={`${smallButton} bg-indigo-600 text-white`}>
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setName(subject.name);
              setError('');
            }}
            className={`${smallButton} text-slate-600 hover:bg-slate-100`}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{subject.name}</span>
          <button type="button" onClick={() => setEditing(true)} className={`${smallButton} text-indigo-600 hover:bg-indigo-50`}>
            Rename
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={!canDelete}
            title={canDelete ? undefined : 'Keep at least one subject'}
            className={`${smallButton} text-rose-600 hover:bg-rose-50`}
          >
            Delete
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
    </li>
  );
}
