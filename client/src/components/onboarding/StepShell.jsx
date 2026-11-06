// The frame around every onboarding step: logo, "Step 2 of 3" + progress bar, title, content.
import { useAuth } from '../../hooks/useAuth.js';

export default function StepShell({ step, totalSteps = 3, title, subtitle, children }) {
  const { logout } = useAuth();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-6">
      <header className="flex items-center gap-2">
        <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
        <span className="font-bold tracking-tight">Study Buddy</span>
        <button type="button" onClick={logout} className="ml-auto min-h-11 rounded-lg px-3 text-sm text-muted hover:bg-surface-2">
          Log out
        </button>
      </header>

      <div className="mt-6">
        <p className="text-sm font-medium text-accent">
          Step {step} of {totalSteps}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-line" aria-hidden="true">
          <div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </div>

      <section className="mt-6 rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-line">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
