// Guard for /onboarding: must be logged in, and only until onboarding is finished.
// When onboarding completes, updateUser() flips `onboardingCompleted` and this sends them home.
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { homePathFor } from '../utils/roles.js';

export default function OnboardingRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingCompleted) return <Navigate to={homePathFor(user.role)} replace />;
  return <Outlet />;
}
