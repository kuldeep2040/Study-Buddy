// Settings: exam name/date + daily goal. "Save" sends only what changed.
import { useState } from 'react';
import { updateSettings } from '../../api/settings.js';
import { getFormErrors } from '../../api/client.js';
import { todayIst } from '../../utils/format.js';
import Card from '../ui/Card.jsx';
import TextField from '../ui/TextField.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import GoalPicker from '../onboarding/GoalPicker.jsx';

export default function ExamGoalCard({ settings, onSaved }) {
  const [form, setForm] = useState({
    examName: settings.examName,
    examDate: settings.examDate ?? '',
    dailyGoalMinutes: settings.dailyGoalMinutes,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ tone: 'success', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const changes = Object.fromEntries(Object.entries(form).filter(([key, value]) => value !== (settings[key] ?? '')));
  const dirty = Object.keys(changes).length > 0;

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage({ tone: 'success', text: '' });
  };

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    try {
      onSaved(await updateSettings(changes));
      setMessage({ tone: 'success', text: 'Saved ✓' });
    } catch (err) {
      const { formError, fieldErrors: byField } = getFormErrors(err);
      setFieldErrors(byField);
      setMessage({ tone: 'error', text: formError });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Exam &amp; daily goal</h2>
      <form onSubmit={handleSave} className="mt-4 space-y-4" noValidate>
        <TextField label="Exam name" name="examName" maxLength={60} value={form.examName} onChange={(e) => setField('examName', e.target.value)} error={fieldErrors.examName} />
        <TextField label="Exam date" name="examDate" type="date" min={todayIst()} value={form.examDate} onChange={(e) => setField('examDate', e.target.value)} error={fieldErrors.examDate} />
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Daily goal</p>
          <GoalPicker value={form.dailyGoalMinutes} onChange={(minutes) => setField('dailyGoalMinutes', minutes)} />
        </div>
        <Alert tone={message.tone}>{message.text}</Alert>
        <Button type="submit" className="w-full" loading={saving} disabled={!dirty}>
          Save
        </Button>
      </form>
    </Card>
  );
}
