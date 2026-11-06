// The centered frame used by the Login and Signup pages.
import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Link to="/login" className="mx-auto mb-6 flex items-center gap-2">
        <img src="/pwa-192x192.png" alt="" className="h-12 w-12 rounded-2xl shadow" />
        <span className="text-xl font-bold tracking-tight">Study Buddy</span>
      </Link>

      <div className="rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-line sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
    </main>
  );
}
