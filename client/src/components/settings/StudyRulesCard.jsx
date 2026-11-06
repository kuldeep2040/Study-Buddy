// Settings: "Require a supporter before studying" switch (off by default). Saves immediately.
import { useState } from 'react';
import { updateSettings } from '../../api/settings.js';
import { getErrorMessage } from '../../api/client.js';
import Card from '../ui/Card.jsx';

export default function StudyRulesCard({ settings, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const on = settings.requireSupporterBeforeStudy;

  async function toggle() {
    setSaving(true);
    setError('');
    try {
      onSaved(await updateSettings({ requireSupporterBeforeStudy: !on }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 id="require-supporter-label" className="font-semibold text-slate-900">
            Require a supporter before studying
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            When on, the Start button is hidden until at least one supporter is linked. Off by default: you can always
            study solo.
          </p>
        </div>
        {/* role="switch" + aria-checked: screen readers announce it as an on/off switch */}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="require-supporter-label"
          disabled={saving}
          onClick={toggle}
          className={`relative mt-1 h-8 w-14 shrink-0 rounded-full transition disabled:opacity-60 ${on ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition ${on ? 'translate-x-6' : ''}`} />
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </Card>
  );
}
