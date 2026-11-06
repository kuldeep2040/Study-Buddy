// Student onboarding step 1: which exam, and when?
import { useState } from 'react';
import { updateSettings } from '../../api/settings.js';
import { getFormErrors } from '../../api/client.js';
import { daysUntil, todayIst } from '../../utils/format.js';
import StepShell from './StepShell.jsx';
import TextField from '../ui/TextField.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';

export default function ExamStep({ settings, onDone }) {
  const [examName, setExamName] = useState(settings.examName || '');
  const [examDate, setExamDate] = useState(settings.examDate || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const daysLeft = examDate ? daysUntil(examDate) : null;

  async function handleSubmit(event) {
    event.preventDefault();
    const missing = {};
    if (!examName.trim()) missing.examName = 'Please enter the exam name';
    if (!examDate) missing.examDate = 'Please pick the exam date';
    if (Object.keys(missing).length) return setFieldErrors(missing);

    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      onDone(await updateSettings({ examName, examDate }));
    } catch (err) {
      const { formError, fieldErrors: byField } = getFormErrors(err);
      setError(formError);
      setFieldErrors(byField);
      setSaving(false);
    }
  }

  return (
    <StepShell step={1} title="What are you preparing for? 🎯" subtitle="We'll count down the days with you.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert tone="error">{error}</Alert>
        <TextField
          label="Exam name"
          name="examName"
          placeholder="e.g. JEE Main, NEET, Boards"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          error={fieldErrors.examName}
          maxLength={60}
        />
        <TextField
          label="Exam date"
          name="examDate"
          type="date"
          min={todayIst()}
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          error={fieldErrors.examDate}
        />
        {daysLeft !== null && daysLeft >= 0 && (
          <p className="rounded-xl bg-indigo-50 px-4 py-3 text-center text-indigo-900">
            📅 <strong>{daysLeft}</strong> {daysLeft === 1 ? 'day' : 'days'} to go. Let&apos;s make them count!
          </p>
        )}
        <Button type="submit" size="lg" loading={saving} className="w-full">
          Next
        </Button>
      </form>
    </StepShell>
  );
}
