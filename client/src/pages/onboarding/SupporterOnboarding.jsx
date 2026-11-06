// Supporter onboarding: 1) enter a code (or "no code yet")  2) linked 🎉 + connect Telegram (optional).
// Re-checks the server every 5s, so "Telegram connected" shows up by itself after pressing Start in Telegram.
import { useState } from 'react';
import { getSupporterDashboard } from '../../api/supporter.js';
import { completeOnboarding } from '../../api/settings.js';
import { getErrorMessage } from '../../api/client.js';
import { useAuth } from '../../hooks/useAuth.js';
import { usePolledData } from '../../hooks/usePolledData.js';
import FullPageStatus from '../../components/FullPageStatus.jsx';
import StepShell from '../../components/onboarding/StepShell.jsx';
import LinkStudentForm from '../../components/supporter/LinkStudentForm.jsx';
import TelegramConnect from '../../components/supporter/TelegramConnect.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';

export default function SupporterOnboarding() {
  const { updateUser } = useAuth();
  const { data, refresh } = usePolledData(getSupporterDashboard, { intervalMs: 5000 });
  const [linkedId, setLinkedId] = useState(null); // linkId right after entering a code
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');

  if (!data) return <FullPageStatus message="Getting things ready…" />;

  // Just linked, or linked earlier (e.g. they refreshed the page) → step 2.
  const student = data.students.find((s) => s.linkId === linkedId) ?? (linkedId ? null : data.students[0]);

  async function finish() {
    setFinishing(true);
    setError('');
    try {
      updateUser(await completeOnboarding()); // the route guard then opens the dashboard
    } catch (err) {
      setError(getErrorMessage(err));
      setFinishing(false);
    }
  }

  if (!student && !linkedId) {
    return (
      <StepShell step={1} totalSteps={2} title="Link with your student 🤝" subtitle="Enter the invite code they sent you.">
        <div className="space-y-5">
          <LinkStudentForm
            onLinked={(result) => {
              setLinkedId(result.linkId);
              refresh();
            }}
          />
          <div className="rounded-2xl bg-surface-2 p-4 text-sm text-ink-soft ring-1 ring-line">
            <p className="font-semibold text-ink">No code yet? ⏳</p>
            <p className="mt-1">
              Ask your student to open Study Buddy → <strong>Settings → Invite a supporter</strong>. They can send you the
              code on WhatsApp. It works once, for 24 hours.
            </p>
          </div>
          <Alert tone="error">{error}</Alert>
          <Button variant="ghost" className="w-full" loading={finishing} onClick={finish}>
            I&apos;ll do this later
          </Button>
        </div>
      </StepShell>
    );
  }

  // Linked, but the dashboard hasn't reloaded yet: wait a moment.
  if (!student) return <FullPageStatus message="Linking…" />;

  return (
    <StepShell step={2} totalSteps={2} title={`You're following ${student.name} 🎉`}>
      <div className="space-y-4">
        <p className="text-muted">You can now see their study progress (read-only) on your dashboard.</p>
        <div className="rounded-2xl bg-surface-2 p-4 ring-1 ring-line">
          <p className="font-semibold text-ink">Get updates on Telegram 📱 (optional)</p>
          <p className="mt-1 mb-3 text-sm text-muted">
            You&apos;ll get a message when {student.name} starts and stops studying. Without it you still have your dashboard.
          </p>
          <TelegramConnect linkId={student.linkId} connected={student.telegramConnected} onChange={refresh} />
        </div>
        <Alert tone="error">{error}</Alert>
        <Button size="lg" className="w-full" loading={finishing} onClick={finish}>
          {student.telegramConnected ? 'Finish' : 'Skip for now'}
        </Button>
      </div>
    </StepShell>
  );
}
