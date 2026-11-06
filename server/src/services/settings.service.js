// The student's settings: exam, daily goal, "require a supporter", and onboarding.
import { Settings } from '../models/Settings.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { daysBetween, toIstDateString } from '../utils/time.js';

/**
 * Returns the student's Settings, creating it with defaults if it's somehow missing
 * ("upsert" = update if it exists, insert if it doesn't). Normally it's created at signup.
 */
export async function getOrCreateSettings(userId) {
  return Settings.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
}

/** What the browser receives. `examDaysLeft` = calendar days from today (IST) to the exam. */
function toSettingsView(settings) {
  const today = toIstDateString();
  return {
    examName: settings.examName,
    examDate: settings.examDate,
    examDaysLeft: settings.examDate ? daysBetween(today, settings.examDate) : null,
    dailyGoalMinutes: settings.dailyGoalMinutes,
    requireSupporterBeforeStudy: settings.requireSupporterBeforeStudy,
    pomodoro: {
      focusMinutes: settings.pomodoro.focusMinutes,
      shortBreakMinutes: settings.pomodoro.shortBreakMinutes,
      longBreakMinutes: settings.pomodoro.longBreakMinutes,
      roundsBeforeLongBreak: settings.pomodoro.roundsBeforeLongBreak,
    },
    soundEnabled: settings.soundEnabled,
  };
}

export async function getSettings(userId) {
  return toSettingsView(await getOrCreateSettings(userId));
}

/** Updates only the fields that were sent (they're already validated by zod). */
export async function updateSettings(userId, changes) {
  if (changes.examDate && changes.examDate < toIstDateString()) {
    // 'YYYY-MM-DD' strings compare correctly as text.
    throw new AppError(400, "The exam date can't be in the past", [
      { field: 'examDate', message: "The exam date can't be in the past" },
    ]);
  }
  const settings = await getOrCreateSettings(userId);
  settings.set(changes);
  await settings.save();
  return toSettingsView(settings);
}

/** Marks onboarding as done. Students must have told us about their exam first. */
export async function completeOnboarding(user) {
  if (user.role === 'student') {
    const settings = await getOrCreateSettings(user.id);
    if (!settings.examName || !settings.examDate) {
      throw new AppError(400, 'Please add your exam name and date first');
    }
  }
  // Only set it if it isn't set yet, so calling this twice keeps the FIRST completion time.
  await User.updateOne({ _id: user.id, onboardingCompletedAt: null }, { $set: { onboardingCompletedAt: new Date() } });
  return (await User.findById(user.id)).toJSON();
}
