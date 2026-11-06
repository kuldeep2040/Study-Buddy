// A supporter's Telegram connection for ONE link.
// Two taps: "Connect Telegram" (we create a one-time code) → "Open Telegram" (a real link, so
// phones open the Telegram app; browsers block windows opened after a network request).
// See TelegramOpenOptions for the tg:// link + fallbacks (some ISPs block t.me).
import { useState } from 'react';
import { connectTelegram, disconnectTelegram } from '../../api/supporter.js';
import { getErrorMessage } from '../../api/client.js';
import Button from '../ui/Button.jsx';
import TelegramOpenOptions from './TelegramOpenOptions.jsx';

export default function TelegramConnect({ linkId, connected, onChange }) {
  const [deepLink, setDeepLink] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (connected) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-emerald-700">✅ Telegram connected</p>
        <Button
          variant="ghost"
          loading={busy}
          onClick={() =>
            run(async () => {
              await disconnectTelegram(linkId);
              setDeepLink(null);
              onChange?.();
            })
          }
        >
          Disconnect
        </Button>
        {error && <p className="w-full text-sm text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {deepLink ? (
        <>
          <TelegramOpenOptions deepLink={deepLink} />
          {import.meta.env.DEV && (
            <p className="text-xs text-amber-700">
              Dev note: Telegram can only reach Study Buddy once it&apos;s deployed online, so this won&apos;t connect on
              localhost.
            </p>
          )}
        </>
      ) : (
        <Button
          className="w-full"
          loading={busy}
          onClick={() => run(async () => setDeepLink((await connectTelegram(linkId)).deepLink))}
        >
          Connect Telegram
        </Button>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
