// Settings → "Study rules" section: "Require a supporter before studying" switch (off by default). Saves immediately.
import { useState } from 'react';
import { updateSettings } from '../../api/settings.js';
import { getErrorMessage } from '../../api/client.js';

export default function StudyRulesSettings({ settings, onSaved }) {
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
    <div>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p id="require-supporter-label" className="font-semibold text-ink">
            Require a supporter before studying
          </p>
          <p className="mt-1 text-sm text-muted">
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
          className={`relative mt-1 h-8 w-14 shrink-0 rounded-full transition disabled:opacity-60 ${on ? 'bg-brand' : 'bg-line'}`}
        >
          <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-surface shadow transition ${on ? 'translate-x-6' : ''}`} />
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
