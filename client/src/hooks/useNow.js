// Returns the current time (ms) and re-renders every `intervalMs` — the "tick" behind live timers.
// When `enabled` is false, nothing ticks (saves battery when no session is running).
import { useEffect, useState } from 'react';

export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id); // stop ticking when the component goes away
  }, [intervalMs, enabled]);

  return now;
}
