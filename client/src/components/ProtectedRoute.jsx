// Route guard for private pages.
//   Not logged in         → /login (and remember where they wanted to go)
//   Onboarding not done   → /onboarding
//   Wrong role            → their own home (a supporter opening "/" lands on "/supporter")
//   Otherwise             → show the page (<Outlet /> = the nested route's element)
// NOTE: this is for a nice user experience only. Real security is on the SERVER, which checks
// the role and links on every request.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { homePathFor } from '../utils/roles.js';

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return <Outlet />;
}
