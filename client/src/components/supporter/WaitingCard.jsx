// A request the student hasn't answered yet. No student data is shown (nothing is shared until they
// accept), but the supporter can already connect Telegram or cancel the request.
import { useState } from 'react';
import { endLink } from '../../api/links.js';
import { getErrorMessage } from '../../api/client.js';
import TelegramConnect from './TelegramConnect.jsx';

export default function WaitingCard({ request, onChanged }) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  async function cancel() {
    if (!window.confirm(`Cancel your request to ${request.studentName}?`)) return;
    setCancelling(true);
    setError('');
    try {
      await endLink(request.linkId);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200" data-testid="waiting-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-amber-950">⏳ Waiting for {request.studentName}</p>
          <p className="text-sm text-amber-900">They need to accept your request in their app. Nothing is shared until then.</p>
        </div>
        <button type="button" onClick={cancel} disabled={cancelling} className="-mt-2 -mr-2 min-h-11 shrink-0 rounded-lg px-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60">
          {cancelling ? 'Cancelling…' : 'Cancel'}
        </button>
      </div>
      <div className="rounded-xl bg-white p-3 ring-1 ring-amber-200">
        <TelegramConnect linkId={request.linkId} connected={request.telegramConnected} onChange={onChanged} />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
