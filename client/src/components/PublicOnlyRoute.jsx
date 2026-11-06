// For /login and /signup: if you're logged in, you don't belong here → go to the right page.
// This is ALSO what moves you onward right after a successful login/signup: the moment the user
// is set, this component re-renders and redirects. (One place decides — no competing redirects.)
//   - If ProtectedRoute sent you here from a page (e.g. /settings), go back there.
//   - Otherwise go to your role's home screen.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { homePathFor } from '../utils/roles.js';

export default function PublicOnlyRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    // If "from" is a page for the other role, ProtectedRoute will correct it on arrival.
    return <Navigate to={location.state?.from || homePathFor(user.role)} replace />;
  }
  return <Outlet />;
}
