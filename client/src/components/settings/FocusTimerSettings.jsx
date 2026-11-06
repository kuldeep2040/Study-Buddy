// Settings → "Focus timer": Pomodoro lengths and the sound. "Save" sends only what changed.
// The lengths apply to the NEXT Pomodoro session (a running one keeps the lengths it started with).
import { useState } from 'react';
import { updateSettings } from '../../api/settings.js';
import { getFormErrors } from '../../api/client.js';
import { playChime, unlockSound } from '../../utils/alerts.js';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';

const FIELDS = [
  { key: 'focusMinutes', label: 'Focus', unit: 'min', min: 5, max: 90, step: 5 },
  { key: 'shortBreakMinutes', label: 'Short break', unit: 'min', min: 1, max: 30, step: 1 },
  { key: 'longBreakMinutes', label: 'Long break', unit: 'min', min: 5, max: 60, step: 5 },
  { key: 'roundsBeforeLongBreak', label: 'Long break after', unit: 'rounds', min: 2, max: 8, step: 1 },
];

function Stepper({ field, value, onChange }) {
  const set = (next) => onChange(Math.min(field.max, Math.max(field.min, next)));
  const buttonClass = 'flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-lg font-bold text-ink disabled:opacity-40';
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm font-medium text-ink-soft">{field.label}</span>
      <div className="flex items-center gap-2">
        <button type="button" className={buttonClass} aria-label={`${field.label}: less`} disabled={value <= field.min} onClick={() => set(value - field.step)}>
          −
        </button>
        <span className="w-20 text-center font-bold text-ink tabular-nums" aria-live="polite">
          {value} {field.unit}
        </span>
        <button type="button" className={buttonClass} aria-label={`${field.label}: more`} disabled={value >= field.max} onClick={() => set(value + field.step)}>
          +
        </button>
      </div>
    </div>
  );
}

export default function FocusTimerSettings({ settings, onSaved }) {
  const [pomodoro, setPomodoro] = useState(settings.pomodoro);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ tone: 'success', text: '' });

  const changes = {
    ...(JSON.stringify(pomodoro) !== JSON.stringify(settings.pomodoro) && { pomodoro }),
    ...(soundEnabled !== settings.soundEnabled && { soundEnabled }),
  };
  const dirty = Object.keys(changes).length > 0;

  function setField(key, value) {
    setPomodoro((current) => ({ ...current, [key]: value }));
    setMessage({ tone: 'success', text: '' });
  }

  async function handleSave() {
    setSaving(true);
    try {
      onSaved(await updateSettings(changes));
      setMessage({ tone: 'success', text: 'Saved ✓ (used from your next Pomodoro session)' });
    } catch (err) {
      setMessage({ tone: 'error', text: getFormErrors(err).formError });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="divide-y divide-line">
        {FIELDS.map((field) => (
          <Stepper key={field.key} field={field} value={pomodoro[field.key]} onChange={(value) => setField(field.key, value)} />
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-3">
        <div className="flex-1">
          <p id="sound-label" className="text-sm font-medium text-ink-soft">
            Sound when a round or break ends
          </p>
          <button
            type="button"
            className="text-sm font-semibold text-accent"
            onClick={() => {
              unlockSound();
              playChime('alert');
            }}
          >
            ▶ Test sound
          </button>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={soundEnabled}
          aria-labelledby="sound-label"
          onClick={() => setSoundEnabled((on) => !on)}
          className={`relative h-8 w-14 shrink-0 rounded-full transition ${soundEnabled ? 'bg-brand' : 'bg-line'}`}
        >
          <span className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-surface shadow transition ${soundEnabled ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      <Alert tone={message.tone}>{message.text}</Alert>
      <Button className="w-full" loading={saving} disabled={!dirty} onClick={handleSave}>
        Save
      </Button>
    </div>
  );
}
