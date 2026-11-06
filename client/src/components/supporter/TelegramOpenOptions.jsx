// Three ways to send "/start <code>" to our bot, from most to least convenient:
//   1. tg://resolve…  → opens the Telegram APP directly (no website involved, so it can't be
//                        blocked by internet providers that block t.me — e.g. some Indian ISPs)
//   2. https://t.me/… → the normal web link (works where t.me isn't blocked)
//   3. manual          → search the bot in Telegram and send the command yourself (always works)
import { useState } from 'react';

export default function TelegramOpenOptions({ deepLink }) {
  const [copied, setCopied] = useState(false);

  // deepLink looks like https://t.me/<botUsername>?start=<code>
  const url = new URL(deepLink);
  const botUsername = url.pathname.slice(1);
  const code = url.searchParams.get('start');
  const appLink = `tg://resolve?domain=${botUsername}&start=${code}`;
  const command = `/start ${code}`;

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      setCopied(false); // the command is selectable, so they can copy it by hand
    }
  }

  return (
    <div className="space-y-3">
      <a
        href={appLink}
        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#229ED9] px-4 text-sm font-semibold text-white hover:brightness-95"
      >
        Open Telegram
      </a>
      <p className="text-sm text-slate-600">
        In Telegram, press <strong>Start</strong>. This page updates by itself within a few seconds. Works once, for 1
        hour.
      </p>

      <details className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">
        <summary className="cursor-pointer font-medium">Telegram didn&apos;t open?</summary>
        <div className="mt-3 space-y-3">
          <p>
            Try the{' '}
            <a href={deepLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 underline">
              web link
            </a>{' '}
            (some internet providers block it), or do it by hand:
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              In Telegram, search for <strong>@{botUsername}</strong> and open it.
            </li>
            <li>Send this exact message:</li>
          </ol>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 font-mono text-xs ring-1 ring-slate-200 select-all" data-testid="telegram-command">
              {command}
            </code>
            <button type="button" onClick={copyCommand} className="min-h-11 shrink-0 rounded-lg px-3 font-medium text-indigo-600 hover:bg-indigo-50">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
