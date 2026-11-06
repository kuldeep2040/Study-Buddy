// Student onboarding: 1) exam  2) subjects + daily goal  3) invite a supporter (or skip).
// Each step SAVES to the server before moving on, so a refresh never loses work.
import { useEffect, useState } from 'react';
import { getSettings } from '../../api/settings.js';
import FullPageStatus from '../../components/FullPageStatus.jsx';
import ExamStep from '../../components/onboarding/ExamStep.jsx';
import StudyPlanStep from '../../components/onboarding/StudyPlanStep.jsx';
import InviteStep from '../../components/onboarding/InviteStep.jsx';

export default function StudentOnboarding() {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState(null); // prefill if they started before

  useEffect(() => {
    const controller = new AbortController();
    getSettings({ signal: controller.signal })
      .then(setSettings)
      .catch(() => {
        // Not fatal: start with empty fields.
        if (!controller.signal.aborted) setSettings({ examName: '', examDate: null, dailyGoalMinutes: 240 });
      });
    return () => controller.abort();
  }, []);

  if (!settings) return <FullPageStatus message="Getting things ready…" />;

  if (step === 1) {
    return (
      <ExamStep
        settings={settings}
        onDone={(updated) => {
          setSettings(updated);
          setStep(2);
        }}
      />
    );
  }
  if (step === 2) {
    return (
      <StudyPlanStep
        settings={settings}
        onBack={() => setStep(1)}
        onDone={(updated) => {
          setSettings(updated);
          setStep(3);
        }}
      />
    );
  }
  return <InviteStep examName={settings.examName} onBack={() => setStep(2)} />;
}
