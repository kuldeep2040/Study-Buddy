// Tells the student EXACTLY what is shared, and with whom. (Core principle: transparency.)
// `supporters` = active links from GET /api/links (null while loading).
import { Link } from 'react-router-dom';

export default function TransparencyNote({ supporters }) {
  const settingsLink = (
    <Link to="/settings" className="font-semibold underline">
      Settings
    </Link>
  );

  let message;
  if (!supporters) {
    message = <>Your supporter receives a Telegram message when you start and stop studying.</>;
  } else if (supporters.length === 0) {
    message = (
      <>
        🔒 <strong>Nothing is shared right now.</strong> No supporters are linked. Your sessions are still saved for you.
      </>
    );
  } else {
    const names = supporters.map((s) => s.supporterName).join(', ');
    message = (
      <>
        🔔 <strong>Shared with {names}:</strong> your supporter receives a Telegram message when you start and stop
        studying (if they connected Telegram), and can see today&apos;s total, your current session and your study
        history. They can&apos;t change anything. Manage this in {settingsLink}.
      </>
    );
  }

  return <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 ring-1 ring-indigo-200">{message}</p>;
}
