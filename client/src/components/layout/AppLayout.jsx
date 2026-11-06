// The frame around every logged-in page: top bar (logo, nav, logout) + page content.
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const NAV_BY_ROLE = {
  student: [
    { to: '/', label: 'Home', end: true },
    { to: '/history', label: 'History' },
    { to: '/settings', label: 'Settings' },
  ],
  supporter: [{ to: '/supporter', label: 'My students', end: false }],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  const links = NAV_BY_ROLE[user.role] ?? [];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="hidden font-bold tracking-tight sm:inline">Study Buddy</span>

          <nav className="flex gap-0.5 sm:ml-2 sm:gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition sm:px-3 ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="ml-auto rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap text-slate-600 hover:bg-slate-100 disabled:opacity-60 sm:px-3"
          >
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  );
}
