// Supporter onboarding step 2: "waiting for X to accept" → accepted / declined.
// The parent re-checks the server every few seconds, so this updates by itself.
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function RequestStatus({ state, studentName, onNext, onTryAnotherCode }) {
  if (state === 'accepted') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-5xl">🎉</p>
        <p className="text-lg font-semibold">{studentName} accepted your request!</p>
        <p className="text-slate-600">You can now see their study progress (read-only).</p>
        <Button size="lg" className="w-full" onClick={onNext}>
          Next
        </Button>
      </div>
    );
  }

  if (state === 'declined') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-semibold">{studentName} declined the request</p>
        <p className="text-slate-600">That&apos;s okay. If it was a mistake, ask them for a new code.</p>
        <Button size="lg" className="w-full" onClick={onTryAnotherCode}>
          Enter another code
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900 ring-1 ring-amber-200">
        <Spinner className="h-5 w-5 shrink-0" />
        <p>
          Waiting for <strong>{studentName}</strong> to accept your request. They&apos;ll see it when they open Study
          Buddy.
        </p>
      </div>
      <p className="text-sm text-slate-600">
        You don&apos;t have to wait here: set up Telegram now, and your dashboard will show them once they accept.
      </p>
      <Button size="lg" className="w-full" onClick={onNext}>
        Next: Telegram (optional)
      </Button>
    </div>
  );
}
