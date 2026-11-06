// Everything about the student's study sessions: the running session, today's list, start and stop.
//
// The SERVER is the source of truth. On load (and whenever the tab becomes visible again) we ask
// it what's running — that's how a refresh, a closed tab, or a second device all "resume" correctly.
import { useCallback, useEffect, useState } from 'react';
import * as sessionsApi from '../api/sessions.js';
import { getErrorMessage } from '../api/client.js';

export function useStudySession() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [busy, setBusy] = useState(false); // true while Start/Stop is in progress
  // How far the phone's clock is from the server's (ms). Live timers add this to Date.now().
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const syncClock = (serverTime) => setClockOffsetMs(Date.parse(serverTime) - Date.now());

  // Load (or reload) from the server.
  useEffect(() => {
    // AbortController = a "cancel button" for requests. If this effect is cleaned up (component
    // closed, or a newer reload started), we cancel the old requests and ignore their answers.
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([sessionsApi.getActiveSession({ signal }), sessionsApi.getTodaySessions({ signal })])
      .then(([active, today]) => {
        if (signal.aborted) return;
        setClockOffsetMs(Date.parse(today.serverTime) - Date.now());
        setActiveSession(active.session);
        setTodaySessions(today.sessions);
        setError('');
        setStatus('ready');
      })
      .catch((err) => {
        if (signal.aborted) return;
        setError(getErrorMessage(err));
        // If we already showed data, keep showing it; only show the error screen on first load.
        setStatus((current) => (current === 'ready' ? 'ready' : 'error'));
      });
    return () => controller.abort();
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const retry = useCallback(() => {
    setStatus('loading');
    refresh();
  }, [refresh]);

  // Phone unlocked / tab switched back → the session may have changed elsewhere (other device,
  // auto-stop after 4h, a new day began). Quietly re-check.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [refresh]);

  const start = useCallback(
    async (subject) => {
      setBusy(true);
      try {
        const { session, serverTime } = await sessionsApi.startSession(subject);
        syncClock(serverTime);
        setActiveSession(session);
        setTodaySessions((list) => [session, ...list]);
        return session;
      } catch (err) {
        refresh(); // e.g. 409: already running on another device → show the real state
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const stop = useCallback(async () => {
    setBusy(true);
    try {
      const result = await sessionsApi.stopSession();
      syncClock(result.serverTime);
      setActiveSession(null);
      setTodaySessions((list) => list.map((s) => (s.id === result.session.id ? result.session : s)));
      return result; // { session, todayTotalMinutes }
    } catch (err) {
      refresh(); // e.g. 404: it was already stopped (auto-stop or another device)
      throw err;
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  return { status, error, activeSession, todaySessions, busy, clockOffsetMs, start, stop, refresh, retry };
}
