// Moon/sun button in the top bar: switches between light and dark (and remembers it on this device).
// Settings → Appearance also offers "Auto" (follow the phone).
import { useTheme } from '../../hooks/useTheme.js';
import Icon from '../ui/Icon.jsx';

export default function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const next = mode === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface-2"
    >
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
    </button>
  );
}
