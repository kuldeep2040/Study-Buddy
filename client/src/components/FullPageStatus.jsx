// Full-screen loading state. If loading takes more than a few seconds, we explain why:
// Render's free server "sleeps" when idle and needs up to ~50s to wake up.
import { useEffect, useState } from 'react';
import Spinner from './ui/Spinner.jsx';

const SLOW_AFTER_MS = 3000;

export default function FullPageStatus({ message = 'Loading…' }) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer); // cleanup if the page finishes loading first
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <Spinner className="h-8 w-8 text-indigo-600" />
      <p className="font-medium text-slate-700">{isSlow ? 'Waking up the server… ☕' : message}</p>
      {isSlow && (
        <p className="max-w-xs text-sm text-slate-500">
          The first visit after a break can take up to a minute. Thanks for your patience!
        </p>
      )}
    </div>
  );
}
