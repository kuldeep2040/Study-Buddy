// Holds "who is logged in?" for the WHOLE app, so any component can ask without passing props around.
//
// On app start we call GET /api/auth/me:
//   - 200 → the cookie is valid, we know the user
//   - 401 → not logged in (normal, not an error)
//   - anything else (server down / asleep too long) → show a "try again" screen
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContext.js';
import * as authApi from '../api/auth.js';
import { api } from '../api/client.js';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  // Changing this number re-runs the "who is logged in?" check (used by the Try again button).
  const [checkCount, setCheckCount] = useState(0);

  // Ask the server who is logged in.
  useEffect(() => {
    // If this effect is cleaned up before the answer arrives (e.g. React StrictMode runs effects
    // twice in development), ignore the late answer so it can't overwrite newer state.
    let ignore = false;

    authApi
      .getMe()
      .then((me) => {
        if (ignore) return;
        setUser(me);
        setStatus('ready');
      })
      .catch((error) => {
        if (ignore) return;
        if (error.response?.status === 401) {
          setUser(null); // simply not logged in — that's normal
          setStatus('ready');
        } else {
          setStatus('error'); // server unreachable
        }
      });

    return () => {
      ignore = true;
    };
  }, [checkCount]);

  // "Try again" button on the can't-reach-server screen.
  const retry = useCallback(() => {
    setStatus('loading');
    setCheckCount((count) => count + 1);
  }, []);

  // If ANY later request says 401 (e.g. the login expired after 7 days), forget the user.
  // ProtectedRoute then sends them to the login page automatically.
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url || '';
        if (error.response?.status === 401 && !url.startsWith('/auth/')) {
          setUser(null);
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptorId);
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authApi.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (details) => {
    const newUser = await authApi.signup(details);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null); // even if the request fails, log out locally
    }
  }, []);

  // For when the server sends back a fresh user object (e.g. after finishing onboarding).
  const updateUser = useCallback((updated) => setUser(updated), []);

  // useMemo: only create a new value object when something actually changed,
  // so components using useAuth() don't re-render for no reason.
  const value = useMemo(
    () => ({ user, status, login, signup, logout, retry, updateUser }),
    [user, status, login, signup, logout, retry, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
