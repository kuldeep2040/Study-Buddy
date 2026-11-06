// Student settings + onboarding.
import { api } from './client.js';

/** → { examName, examDate, examDaysLeft, dailyGoalMinutes, requireSupporterBeforeStudy } */
export async function getSettings({ signal } = {}) {
  const { data } = await api.get('/settings', { signal });
  return data.settings;
}

/** Send only the fields that changed. → the full updated settings */
export async function updateSettings(changes) {
  const { data } = await api.patch('/settings', changes);
  return data.settings;
}

/** Any role. → the updated user (with onboardingCompleted: true) */
export async function completeOnboarding() {
  const { data } = await api.post('/onboarding/complete');
  return data.user;
}
