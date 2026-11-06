// Supporter view "Telegram updates": connect/disconnect works today; the in-app feed of the
// messages (shown in the design) isn't built yet, so it's marked "coming soon".
import Card from '../ui/Card.jsx';
import Icon from '../ui/Icon.jsx';
import ComingSoon from '../ui/ComingSoon.jsx';
import TelegramConnect from './TelegramConnect.jsx';

export default function TelegramUpdatesCard({ linkId, connected, onChange }) {
  return (
    <Card className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
        <Icon name="send" className="h-5 w-5 text-accent" /> Telegram updates
      </h2>
      <TelegramConnect linkId={linkId} connected={connected} onChange={onChange} />
      <div className="rounded-2xl bg-surface-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-ink">Message history</p>
          <ComingSoon />
        </div>
        <p className="mt-1 text-sm text-muted">The start and stop messages you receive will also be listed here.</p>
      </div>
    </Card>
  );
}
