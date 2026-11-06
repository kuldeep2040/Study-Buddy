// Round "RT" avatar (your initials) in the top bar. Tap → a small menu with your name,
// "Invite a supporter" (students: opens Settings with the invite code ready) and Log out.
// It closes when you tap outside it or press Escape.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Icon from '../ui/Icon.jsx';
import Spinner from '../ui/Spinner.jsx';

/** "Rahul Kumar" → "RK", "Rahul" → "R". */
function initials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  // Close on a tap outside the menu, or on Escape. Listeners only exist while it's open.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Profile menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-surface">
          {initials(user.name)}
        </span>
      </button>

      {open && (
        <div role="menu" className="absolute top-12 right-0 z-30 w-64 rounded-2xl bg-surface p-2 shadow-lg shadow-black/10 ring-1 ring-line">
          <div className="px-3 py-2">
            <p className="truncate font-semibold text-ink">{user.name}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
            <p className="mt-0.5 text-xs text-faint">{user.role === 'student' ? 'Student' : 'Supporter'} account</p>
          </div>
          <div className="my-1 border-t border-line" />
          {user.role === 'student' && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                // `state` tells Settings to open the invite section and have a code ready.
                navigate('/settings', { state: { open: 'invite' } });
              }}
              className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left font-semibold text-ink hover:bg-surface-2"
            >
              <Icon name="invite" className="h-5 w-5 text-accent" />
              Invite a supporter
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left font-semibold text-danger hover:bg-danger-soft disabled:opacity-60"
          >
            {loggingOut ? <Spinner className="h-5 w-5" /> : <Icon name="logout" className="h-5 w-5" />}
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      )}
    </div>
  );
}
