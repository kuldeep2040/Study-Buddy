// One study session: from pressing "Start" to "Stop" (or auto-stop).
// Pauses (and Pomodoro breaks) are stored inside the session; study time = time minus pauses.
// See utils/sessionClock.js for all the timing maths.
import mongoose from 'mongoose';

export const SESSION_STATUS = ['active', 'completed', 'auto-stopped'];
export const SESSION_MODES = ['normal', 'pomodoro'];

// One pause. end = null while it's still going. 'break' = an automatic Pomodoro break.
const pauseSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, default: null },
  reason: { type: String, enum: ['manual', 'break'], required: true },
});

// A COPY of the student's Pomodoro settings when the session started, so changing the settings
// mid-session doesn't change the rounds of a session that's already running.
const pomodoroSchema = new mongoose.Schema(
  {
    focusMinutes: { type: Number, required: true },
    shortBreakMinutes: { type: Number, required: true },
    longBreakMinutes: { type: Number, required: true },
    roundsBeforeLongBreak: { type: Number, required: true },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // A COPY of the subject name at start time, so renaming/deleting a subject later
    // doesn't change or break old sessions.
    subject: { type: String, required: true, trim: true, maxlength: 30 },
    mode: { type: String, enum: SESSION_MODES, default: 'normal' },
    pomodoro: { type: pomodoroSchema, default: null }, // only for mode 'pomodoro'
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null }, // null while running
    pauses: { type: [pauseSchema], default: [] },
    durationMinutes: { type: Number, default: null, min: 0 }, // STUDY time, set on stop; may be fractional
    status: { type: String, enum: SESSION_STATUS, default: 'active' },
    // Why it was auto-stopped: 'limit' = 4h of study reached, 'long-pause' = paused for over an hour.
    autoStopReason: { type: String, enum: ['limit', 'long-pause'], default: undefined },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        ret.pauses = (ret.pauses ?? []).map(({ start, end, reason }) => ({ start, end, reason }));
        return ret;
      },
    },
  },
);

// Fast "my sessions, newest first" / "my sessions today" queries.
sessionSchema.index({ userId: 1, startTime: -1 });

// ⭐ The database itself guarantees ONE active session per user:
// a unique index that only applies to documents with status 'active' (a "partial" index).
// A PAUSED session is still 'active', so you can't start a second one while one is paused.
sessionSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' }, name: 'one_active_session_per_user' },
);

// Lets the auto-stop job quickly find active sessions that started long ago.
sessionSchema.index({ status: 1, startTime: 1 });

export const Session = mongoose.model('Session', sessionSchema);
