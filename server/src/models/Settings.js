// Per-student preferences. Exactly one document per student (created at signup).
// Subjects, exam, daily goal, the "require a supporter" rule, Pomodoro lengths and sound.
import mongoose from 'mongoose';

export const DEFAULT_SUBJECTS = ['Physics', 'Chemistry', 'Maths'];

// Each subject is a small sub-document with its own _id, so it can be renamed/deleted by id.
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 30 },
});

// Pomodoro lengths (minutes). Copied onto each Pomodoro session when it starts.
const pomodoroSettingsSchema = new mongoose.Schema(
  {
    focusMinutes: { type: Number, min: 5, max: 90, default: 25 },
    shortBreakMinutes: { type: Number, min: 1, max: 30, default: 5 },
    longBreakMinutes: { type: Number, min: 5, max: 60, default: 15 },
    roundsBeforeLongBreak: { type: Number, min: 2, max: 8, default: 4 },
  },
  { _id: false },
);

const settingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    subjects: {
      type: [subjectSchema],
      // A function, so every new student gets their OWN fresh copy of the defaults
      default: () => DEFAULT_SUBJECTS.map((name) => ({ name })),
    },
    // The exam he's preparing for. examDate is an IST calendar day 'YYYY-MM-DD' (not an instant).
    examName: { type: String, trim: true, maxlength: 60, default: '' },
    examDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/, default: null },
    dailyGoalMinutes: { type: Number, min: 15, max: 960, default: 240 },
    // When true, he can't start a session until at least one supporter link is active.
    requireSupporterBeforeStudy: { type: Boolean, default: false },
    // default: () => ({}) creates the sub-document, so the four defaults above are filled in.
    pomodoro: { type: pomodoroSettingsSchema, default: () => ({}) },
    soundEnabled: { type: Boolean, default: true }, // beep at each Pomodoro change (on this account)
  },
  { timestamps: true },
);

export const Settings = mongoose.model('Settings', settingsSchema);
