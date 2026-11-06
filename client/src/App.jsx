// All the app's pages and who may see them.
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthGate from './components/AuthGate.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import HomePage from './pages/HomePage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import RevisePage from './pages/RevisePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SupporterDashboardPage from './pages/SupporterDashboardPage.jsx';
import StudentOverviewPage from './pages/StudentOverviewPage.jsx';
import SupporterSettingsPage from './pages/SupporterSettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import OnboardingRoute from './components/OnboardingRoute.jsx';
import OnboardingPage from './pages/onboarding/OnboardingPage.jsx';

export default function App() {
  return (
    <AuthGate>
      <Routes>
        {/* Only when logged OUT */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Logged in, onboarding not finished yet (either role) */}
        <Route element={<OnboardingRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Students only */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/revise" element={<RevisePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* History now lives at the bottom of Stats; keep old links working */}
            <Route path="/history" element={<Navigate to="/stats" replace />} />
          </Route>
        </Route>

        {/* Supporters only */}
        <Route element={<ProtectedRoute allowedRoles={['supporter']} />}>
          <Route element={<AppLayout />}>
            <Route path="/supporter" element={<SupporterDashboardPage />} />
            <Route path="/supporter/students/:studentId" element={<StudentOverviewPage />} />
            <Route path="/supporter/settings" element={<SupporterSettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthGate>
  );
}
