// Everyone who can see the student's progress (with "gets Telegram?" and Remove), plus requests.
import { useState } from 'react';
import { endLink } from '../../api/links.js';
import { getErrorMessage } from '../../api/client.js';
import Card from '../ui/Card.jsx';
import Alert from '../ui/Alert.jsx';
import LinkRequestCard from '../links/LinkRequestCard.jsx';

const dateFormatter = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });

export default function LinkedSupportersList({ supporters, requests, onChanged }) {
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  async function handleRemove(supporter) {
    const ok = window.confirm(
      `Remove ${supporter.supporterName}? They will immediately stop seeing your progress. You can invite them again later.`,
    );
    if (!ok) return;
    setRemovingId(supporter.linkId);
    setError('');
    try {
      await endLink(supporter.linkId);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold text-slate-900">Your supporters</h2>
      <Alert tone="error">{error}</Alert>

      {requests.map((request) => (
        <LinkRequestCard key={request.linkId} request={request} onDone={onChanged} />
      ))}

      {supporters.length === 0 ? (
        <p className="text-sm text-slate-600">
          🔒 No one is linked, so <strong>nothing is shared</strong>. Create an invite code below if you&apos;d like
          someone to cheer you on.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {supporters.map((supporter) => (
            <li key={supporter.linkId} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{supporter.supporterName}</p>
                <p className="truncate text-sm text-slate-500">
                  {supporter.supporterEmail} · since {dateFormatter.format(new Date(supporter.linkedAt))}
                </p>
                <p className="text-xs text-slate-500">
                  {supporter.telegramConnected ? '📱 Gets Telegram updates' : 'No Telegram (dashboard only)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(supporter)}
                disabled={removingId === supporter.linkId}
                className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                {removingId === supporter.linkId ? 'Removing…' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
