// Create / show / copy / share / cancel the one-time invite code a supporter enters.
// Used in student onboarding (step 3) and in Settings.
import { useState } from 'react';
import { createInvite, endLink } from '../../api/links.js';
import { getErrorMessage } from '../../api/client.js';
import { prettyCode, whatsappInviteUrl } from '../../utils/share.js';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';

function hoursLeft(expiresAt) {
  return Math.max(1, Math.ceil((Date.parse(expiresAt) - Date.now()) / 3600000));
}

export default function InviteCodeCard({ pendingInvite, onInviteChange, examName }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function run(action) {
    setBusy(true);
    setError('');
    setCopied(false);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const handleCreate = () => run(async () => onInviteChange(await createInvite()));
  const handleCancel = () =>
    run(async () => {
      await endLink(pendingInvite.linkId);
      onInviteChange(null);
    });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prettyCode(pendingInvite.code));
      setCopied(true);
    } catch {
      setError("Couldn't copy automatically. Please select the code and copy it.");
    }
  }

  return (
    <div className="space-y-3">
      <Alert tone="error">{error}</Alert>

      {pendingInvite ? (
        <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Your invite code</p>
          <p className="font-mono text-4xl font-bold tracking-widest text-slate-900 select-all" data-testid="invite-code">
            {prettyCode(pendingInvite.code)}
          </p>
          <p className="text-sm text-slate-500">Works once · expires in {hoursLeft(pendingInvite.expiresAt)} hours</p>
          <a
            href={whatsappInviteUrl({ code: pendingInvite.code, examName })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white hover:brightness-95"
          >
            Share on WhatsApp
          </a>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy code'}
            </Button>
            <Button variant="secondary" onClick={handleCreate} loading={busy}>
              New code
            </Button>
            <Button variant="ghost" onClick={handleCancel} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={handleCreate} loading={busy} className="w-full">
          Create invite code
        </Button>
      )}
    </div>
  );
}
