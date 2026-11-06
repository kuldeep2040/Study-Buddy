// Shows a loader while we check the login cookie, or a retry screen if the server can't be reached.
// Only renders the actual pages once we KNOW whether someone is logged in.
import { useAuth } from '../hooks/useAuth.js';
import FullPageStatus from './FullPageStatus.jsx';
import Button from './ui/Button.jsx';

export default function AuthGate({ children }) {
  const { status, retry } = useAuth();

  if (status === 'loading') {
    return <FullPageStatus message="Loading Study Buddy…" />;
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-4xl">😴</p>
        <h1 className="text-lg font-semibold">Can&apos;t reach the server</h1>
        <p className="max-w-xs text-sm text-muted">Check your internet connection and try again.</p>
        <Button onClick={retry}>Try again</Button>
      </div>
    );
  }

  return children;
}
