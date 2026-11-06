// Everyone who can see the student's progress, and whether they get Telegram messages.
// No Remove button: the owner decided only the supporter can end a link ("Stop following").
import Card from '../ui/Card.jsx';

const dateFormatter = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });

export default function LinkedSupportersList({ supporters }) {
  return (
    <Card className="space-y-3">
      <h2 className="font-semibold text-ink">Your supporters</h2>

      {supporters.length === 0 ? (
        <p className="text-sm text-muted">
          🔒 No one is linked, so <strong>nothing is shared</strong>. Create an invite code below if you&apos;d like
          someone to cheer you on.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {supporters.map((supporter) => (
              <li key={supporter.linkId} className="py-3">
                <p className="truncate font-medium text-ink">{supporter.supporterName}</p>
                <p className="truncate text-sm text-muted">
                  {supporter.supporterEmail} · since {dateFormatter.format(new Date(supporter.linkedAt))}
                </p>
                <p className="text-xs text-muted">
                  {supporter.telegramConnected ? '📱 Gets Telegram updates' : 'No Telegram (dashboard only)'}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">Supporters stay linked until they choose to stop following.</p>
        </>
      )}
    </Card>
  );
}
