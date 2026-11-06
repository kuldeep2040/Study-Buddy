// The frame around every onboarding step: logo, "Step 2 of 3" + progress bar, title, content.
import { useAuth } from '../../hooks/useAuth.js';

export default function StepShell({ step, totalSteps = 3, title, subtitle, children }) {
  const { logout } = useAuth();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-6">
      <header className="flex items-center gap-2">
        <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
        <span className="font-bold tracking-tight">Study Buddy</span>
        <button type="button" onClick={logout} className="ml-auto min-h-11 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-100">
          Log out
        </button>
      </header>

      <div className="mt-6">
        <p className="text-sm font-medium text-indigo-700">
          Step {step} of {totalSteps}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-slate-200" aria-hidden="true">
          <div className="h-1.5 rounded-full bg-indigo-600 transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
