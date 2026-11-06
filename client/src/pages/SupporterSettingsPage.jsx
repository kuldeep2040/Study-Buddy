// Supporter settings: appearance + where Telegram lives. Log out is in the top bar (profile menu).
import { useTheme } from '../hooks/useTheme.js';
import AppearanceSettings from '../components/settings/AppearanceSettings.jsx';
import Card from '../components/ui/Card.jsx';
import CollapsibleCard from '../components/ui/CollapsibleCard.jsx';

const THEME_LABEL = { auto: 'Auto (follows your device)', light: 'Light', dark: 'Dark' };

export default function SupporterSettingsPage() {
  const { preference } = useTheme();
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Settings</h1>
      <CollapsibleCard title="Appearance" summary={THEME_LABEL[preference]}>
        <AppearanceSettings />
      </CollapsibleCard>
      <Card>
        <h2 className="font-semibold text-ink">Telegram updates</h2>
        <p className="mt-1 text-sm text-muted">
          Connect or disconnect Telegram on each student&apos;s page (Students → tap a student). Once connected, it&apos;s
          reused for students you link later.
        </p>
      </Card>
    </div>
  );
}
