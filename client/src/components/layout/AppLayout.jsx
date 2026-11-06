// The frame around every logged-in page: a slim top bar (logo · light/dark · profile menu),
// the page content, and a bottom tab bar (like a phone app).
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Icon from '../ui/Icon.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import ProfileMenu from './ProfileMenu.jsx';

const TABS_BY_ROLE = {
  student: [
    { to: '/', label: 'Home', icon: 'home', end: true },
    { to: '/stats', label: 'Stats', icon: 'stats' },
    { to: '/revise', label: 'Revise', icon: 'revise' },
    { to: '/settings', label: 'Settings', icon: 'settings' },
  ],
  supporter: [
    { to: '/supporter', label: 'Students', icon: 'students', end: true, alsoActiveFor: '/supporter/students' },
    { to: '/supporter/settings', label: 'Settings', icon: 'settings' },
  ],
};

export default function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const tabs = TABS_BY_ROLE[user.role] ?? [];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-page/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-2 px-4">
          <Link to={tabs[0]?.to ?? '/'} className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-bold tracking-tight text-ink">Study Buddy</span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* pb-28 leaves room so the last card isn't hidden behind the tab bar */}
      <main className="mx-auto max-w-xl px-4 pt-4 pb-28">
        <Outlet />
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="mx-auto flex max-w-xl">
          {tabs.map((tab) => (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) => {
                  const active = isActive || (tab.alsoActiveFor && pathname.startsWith(tab.alsoActiveFor));
                  return `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition ${
                    active ? 'text-accent' : 'text-muted hover:text-ink'
                  }`;
                }}
              >
                <Icon name={tab.icon} className="h-5 w-5" />
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
