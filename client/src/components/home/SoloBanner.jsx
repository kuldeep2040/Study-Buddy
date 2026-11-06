// "You're studying solo" — shown while no supporter is linked. "Not today" hides it until
// tomorrow on THIS device (saved in localStorage with today's date).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { todayIst } from '../../utils/format.js';

const KEY = 'studybuddy:soloBannerDismissedOn';

function dismissedToday() {
  try {
    return localStorage.getItem(KEY) === todayIst();
  } catch {
    return false; // storage blocked → just show the banner
  }
}

export default function SoloBanner() {
  const [hidden, setHidden] = useState(dismissedToday);
  if (hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, todayIst());
    } catch {
      /* ignore */
    }
    setHidden(true);
  }

  return (
    <div className="flex items-start gap-3 rounded-3xl bg-surface p-4 shadow-sm shadow-black/[0.04]">
      <span className="text-2xl" aria-hidden="true">
        🧑‍🚀
      </span>
      <div className="flex-1">
        <p className="font-semibold text-ink">You&apos;re studying solo.</p>
        <p className="text-sm text-muted">Invite a supporter to stay accountable.</p>
        <div className="mt-2 flex gap-2">
          <Link to="/settings" className="flex min-h-11 items-center rounded-2xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong">
            Invite someone
          </Link>
          <button type="button" onClick={dismiss} className="min-h-11 rounded-2xl px-3 text-sm font-medium text-muted hover:bg-surface-2">
            Not today
          </button>
        </div>
      </div>
    </div>
  );
}
