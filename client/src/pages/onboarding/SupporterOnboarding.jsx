// Supporter onboarding: 1) enter a code (or "waiting for an invite")  2) wait for the student to
// accept  3) connect Telegram (optional). Re-checks the server every 5s so status updates by itself.
import { useState } from 'react';
import { getSupporterDashboard } from '../../api/supporter.js';
import { dismissNotice } from '../../api/links.js';
import { completeOnboarding } from '../../api/settings.js';
import { getErrorMessage } from '../../api/client.js';
import { useAuth } from '../../hooks/useAuth.js';
import { usePolledData } from '../../hooks/usePolledData.js';
import FullPageStatus from '../../components/FullPageStatus.jsx';
import StepShell from '../../components/onboarding/StepShell.jsx';
import RequestStatus from '../../components/onboarding/RequestStatus.jsx';
import LinkStudentForm from '../../components/supporter/LinkStudentForm.jsx';
import TelegramConnect from '../../components/supporter/TelegramConnect.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';

export default function SupporterOnboarding() {
  const { updateUser } = useAuth();
  const { data, refresh } = usePolledData(getSupporterDashboard, { intervalMs: 5000 });
  const [chosenStep, setChosenStep] = useState(null); // null = decide from the data
  const [request, setRequest] = useState(null); // { linkId, studentName } after sending a code
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');

  if (!data) return <FullPageStatus message="Getting things ready…" />;

  // If they already sent a request before (e.g. refreshed the page), pick it up again.
  const existing = data.waiting[0] ?? data.students[0];
  const current = request ?? (existing && { linkId: existing.linkId, studentName: existing.studentName ?? existing.name });
  const step = chosenStep ?? (current ? 2 : 1);

  const accepted = current && data.students.find((s) => s.linkId === current.linkId);
  const pending = current && data.waiting.find((w) => w.linkId === current.linkId);
  const declined = current && data.notices.find((n) => n.linkId === current.linkId && n.kind === 'declined');
  const requestState = accepted ? 'accepted' : declined ? 'declined' : 'waiting';
  const telegramConnected = Boolean((accepted ?? pending)?.telegramConnected);

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

  if (step === 1) {
    return (
      <StepShell step={1} title="Link with your student 🤝" subtitle="Enter the invite code they sent you.">
        <div className="space-y-5">
          <LinkStudentForm
            onRequested={(result) => {
              setRequest({ linkId: result.linkId, studentName: result.student.name });
              setChosenStep(2);
              refresh();
            }}
          />
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
            <p className="font-semibold text-slate-900">No code yet? ⏳</p>
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

  if (step === 2) {
    return (
      <StepShell step={2} title="Request sent 📨">
        <RequestStatus
          state={requestState}
          studentName={current.studentName}
          onNext={() => setChosenStep(3)}
          onTryAnotherCode={() => {
            dismissNotice(current.linkId).catch(() => {});
            setRequest(null);
            setChosenStep(1);
          }}
        />
      </StepShell>
    );
  }

  return (
    <StepShell step={3} title="Get updates on Telegram 📱" subtitle="Optional. Without it you still have your dashboard.">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          You&apos;ll get a message when {current?.studentName ?? 'your student'} starts and stops studying.
        </p>
        {current && <TelegramConnect linkId={current.linkId} connected={telegramConnected} onChange={refresh} />}
        <Alert tone="error">{error}</Alert>
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" onClick={() => setChosenStep(2)}>
            Back
          </Button>
          <Button size="lg" className="flex-1" loading={finishing} onClick={finish}>
            {telegramConnected ? 'Finish' : 'Skip for now'}
          </Button>
        </div>
      </div>
    </StepShell>
  );
}
