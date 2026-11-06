// Light / Dark / Auto (Settings). The moon/sun button in the top bar changes the same setting.
// Saved on this device only (each phone or laptop can choose its own).
import { useTheme } from '../../hooks/useTheme.js';
import SegmentedControl from '../ui/SegmentedControl.jsx';

const OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function AppearanceSettings() {
  const { preference, setPreference } = useTheme();
  return (
    <div>
      <p className="mb-3 text-sm text-muted">Auto follows your phone or laptop setting.</p>
      <SegmentedControl label="Theme" options={OPTIONS} value={preference} onChange={setPreference} />
    </div>
  );
}
