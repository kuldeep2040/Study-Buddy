// Loads data with `fetcher`, then re-loads it every `intervalMs` while the tab is visible,
// and immediately when the tab becomes visible again. Used where data changes ELSEWHERE
// (a supporter watching a student, a student waiting for a supporter to link).
//
// `fetcher` must be stable (wrap it in useCallback if it depends on props).
import { useCallback, useEffect, useState } from 'react';

export function usePolledData(fetcher, { intervalMs = 30000 } = {}) {
  const [data, setData] = useState(null);
  const [receivedAt, setReceivedAt] = useState(0); // Date.now() when `data` arrived (for clock maths)
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null); // the axios error, so callers can check e.g. 404
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetcher({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setReceivedAt(Date.now());
        setError(null);
        setStatus('ready');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err);
        // Keep showing old data on a hiccup — but a 404 (e.g. link removed) must replace it.
        setStatus((current) => (current === 'ready' && err.response?.status !== 404 ? 'ready' : 'error'));
      });
    return () => controller.abort();
  }, [fetcher, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const id = setInterval(refreshIfVisible, intervalMs);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [intervalMs, refresh]);

  // setData is exposed so a page can update the screen right after an action (no waiting for a reload).
  return { data, receivedAt, status, error, refresh, setData };
}
