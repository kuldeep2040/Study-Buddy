// Footnote telling the student EXACTLY what is shared, and with whom. (Core principle: transparency.)
// `supporters` = active links from GET /api/links (null while loading).
import { Link } from 'react-router-dom';
import Icon from './ui/Icon.jsx';

export default function TransparencyNote({ supporters }) {
  let message;
  if (!supporters) {
    message = 'Your supporters get a Telegram message when you start and stop studying.';
  } else if (supporters.length === 0) {
    message = 'Nothing is shared right now: no supporters are linked. Your sessions are still saved for you.';
  } else {
    const names = supporters.map((s) => s.supporterName).join(', ');
    message = (
      <>
        Shared with <strong className="text-ink-soft">{names}</strong>: a Telegram message when you start and stop
        studying (if they connected Telegram), and your progress, read-only.{' '}
        <Link to="/settings" className="font-semibold text-accent underline">
          What they see
        </Link>
      </>
    );
  }

  return (
    <p className="flex gap-2 px-1 text-sm text-muted">
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
