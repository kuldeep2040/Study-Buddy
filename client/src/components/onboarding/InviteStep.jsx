// Student onboarding step 3: invite a supporter (optional). Finishing marks onboarding complete;
// the route guard then sends him to the home screen automatically.
import { useEffect, useState } from 'react';
import { listMyLinks } from '../../api/links.js';
import { completeOnboarding } from '../../api/settings.js';
import { getErrorMessage } from '../../api/client.js';
import { useAuth } from '../../hooks/useAuth.js';
import StepShell from './StepShell.jsx';
import InviteCodeCard from '../settings/InviteCodeCard.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';

export default function InviteStep({ examName, onBack }) {
  const { updateUser } = useAuth();
  const [pendingInvite, setPendingInvite] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');

  // If he already created a code earlier (e.g. before a refresh), show it again.
  useEffect(() => {
    const controller = new AbortController();
    listMyLinks({ signal: controller.signal })
      .then((data) => setPendingInvite(data.pendingInvite))
      .catch(() => {}); // not important: he can create a new one
    return () => controller.abort();
  }, []);

  async function finish() {
    setFinishing(true);
    setError('');
    try {
      updateUser(await completeOnboarding());
    } catch (err) {
      setError(getErrorMessage(err));
      setFinishing(false);
    }
  }

  return (
    <StepShell
      step={3}
      title="Invite a supporter 🤝"
      subtitle="Someone who cheers you on, like a sibling or parent. Optional: you can study solo and invite someone later."
    >
      <div className="space-y-4">
        <Alert tone="error">{error}</Alert>
        <InviteCodeCard pendingInvite={pendingInvite} onInviteChange={setPendingInvite} examName={examName} />
        <p className="text-sm text-slate-600">
          They sign up as a <strong>supporter</strong> and enter your code. Then <strong>you</strong> accept their request,
          and nothing is shared until you do.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" className="flex-1" loading={finishing} onClick={finish}>
            {pendingInvite ? 'Done' : 'Skip for now'}
          </Button>
        </div>
      </div>
    </StepShell>
  );
}
