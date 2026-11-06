// A supporter asked to follow the student. Accept / Decline — and say EXACTLY what accepting shares.
import { useState } from 'react';
import { acceptRequest, declineRequest } from '../../api/links.js';
import { getErrorMessage } from '../../api/client.js';
import Button from '../ui/Button.jsx';

export default function LinkRequestCard({ request, onDone }) {
  const [busy, setBusy] = useState(null); // 'accept' | 'decline' | null
  const [error, setError] = useState('');

  async function respond(kind) {
    setBusy(kind);
    setError('');
    try {
      await (kind === 'accept' ? acceptRequest(request.linkId) : declineRequest(request.linkId));
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-2 ring-indigo-300">
      <p className="font-semibold text-slate-900">
        🤝 {request.supporterName} wants to be your supporter
      </p>
      <p className="text-sm text-slate-500">{request.supporterEmail}</p>
      <p className="mt-3 text-sm text-slate-700">If you accept, they can see (read-only):</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700">
        <li>when you&apos;re studying, and today&apos;s total</li>
        <li>
          your <strong>full study history</strong>, including days before today
        </li>
        <li>Telegram messages when you start and stop (if they connect Telegram)</li>
      </ul>
      <p className="mt-2 text-xs text-slate-500">You can remove them any time in Settings.</p>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" className="flex-1" loading={busy === 'decline'} disabled={Boolean(busy)} onClick={() => respond('decline')}>
          Decline
        </Button>
        <Button className="flex-1" loading={busy === 'accept'} disabled={Boolean(busy)} onClick={() => respond('accept')}>
          Accept
        </Button>
      </div>
    </div>
  );
}
