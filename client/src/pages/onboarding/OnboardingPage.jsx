// /onboarding — shows the right flow for the user's role.
import { useAuth } from '../../hooks/useAuth.js';
import StudentOnboarding from './StudentOnboarding.jsx';
import SupporterOnboarding from './SupporterOnboarding.jsx';

export default function OnboardingPage() {
  const { user } = useAuth();
  return user.role === 'student' ? <StudentOnboarding /> : <SupporterOnboarding />;
}
