// Light / dark theme. The choice ('auto' | 'light' | 'dark') is saved on THIS device only.
// 'auto' follows the phone/laptop setting and switches live when that changes.
// index.html runs the same logic once before the page draws, so there's no white flash.
//
// Several components show the theme (top-bar toggle, Settings → Appearance), so this file is a tiny
// "store": components subscribe, and every change notifies them (see hooks/useTheme.js).

export const THEME_KEY = 'studybuddy:theme';
const PAGE_COLORS = { light: '#f5f3ee', dark: '#161618' }; // browser bar colour (matches --sb-page)
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set();

export function getThemePreference() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return ['light', 'dark'].includes(saved) ? saved : 'auto';
  } catch {
    return 'auto'; // storage blocked (private mode) → just follow the phone
  }
}

/** What is showing right now: 'light' or 'dark'. */
export function getThemeMode() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(preference) {
  const mode = preference === 'auto' ? (darkQuery.matches ? 'dark' : 'light') : preference;
  document.documentElement.dataset.theme = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAGE_COLORS[mode]);
  listeners.forEach((listener) => listener());
}

export function setThemePreference(preference) {
  try {
    if (preference === 'auto') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, preference);
  } catch {
    /* ignore: it still applies for this visit */
  }
  applyTheme(preference);
}

/** Subscribe to theme changes; returns an "unsubscribe" function. */
export function subscribeToTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Call once at startup: applies the theme and follows the phone's setting while on 'auto'. */
export function initTheme() {
  applyTheme(getThemePreference());
  darkQuery.addEventListener('change', () => applyTheme(getThemePreference()));
}
