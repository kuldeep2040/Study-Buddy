// Student onboarding step 2: subjects + daily goal.
import { useState } from 'react';
import { updateSettings } from '../../api/settings.js';
import { getErrorMessage } from '../../api/client.js';
import { useSubjects } from '../../hooks/useSubjects.js';
import StepShell from './StepShell.jsx';
import SubjectChipsEditor from './SubjectChipsEditor.jsx';
import GoalPicker from './GoalPicker.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function StudyPlanStep({ settings, onBack, onDone }) {
  const subjectsState = useSubjects();
  const [goal, setGoal] = useState(settings.dailyGoalMinutes || 240);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleNext() {
    setSaving(true);
    setError('');
    try {
      onDone(await updateSettings({ dailyGoalMinutes: goal }));
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <StepShell step={2} title="Your study plan 📚" subtitle="You can change all of this later in Settings.">
      <div className="space-y-6">
        <Alert tone="error">{error}</Alert>
        <section>
          <h2 className="mb-2 font-semibold text-ink">Subjects</h2>
          {subjectsState.status === 'loading' ? (
            <Spinner className="h-5 w-5 text-accent" />
          ) : subjectsState.status === 'error' ? (
            <p className="text-sm text-danger">{subjectsState.error}</p>
          ) : (
            <SubjectChipsEditor subjectsState={subjectsState} />
          )}
        </section>
        <section>
          <h2 className="font-semibold text-ink">Daily goal</h2>
          <p className="mb-3 text-sm text-muted">How long do you want to study each day?</p>
          <GoalPicker value={goal} onChange={setGoal} />
        </section>
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" className="flex-1" loading={saving} onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </StepShell>
  );
}
