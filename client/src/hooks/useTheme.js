// The current theme for React components, kept in sync everywhere.
// useSyncExternalStore = React's built-in way to read a value that lives OUTSIDE React (here: the
// <html data-theme> attribute + localStorage) and re-render when it changes.
import { useSyncExternalStore } from 'react';
import { getThemeMode, getThemePreference, setThemePreference, subscribeToTheme } from '../utils/theme.js';

export function useTheme() {
  const preference = useSyncExternalStore(subscribeToTheme, getThemePreference); // 'auto' | 'light' | 'dark'
  const mode = useSyncExternalStore(subscribeToTheme, getThemeMode); // what's showing: 'light' | 'dark'
  return {
    preference,
    mode,
    setPreference: setThemePreference,
    toggle: () => setThemePreference(mode === 'dark' ? 'light' : 'dark'),
  };
}
