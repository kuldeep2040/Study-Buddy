// One study session: from pressing "Start" to "Stop" (or auto-stop).
import mongoose from 'mongoose';

export const SESSION_STATUS = ['active', 'completed', 'auto-stopped'];

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // A COPY of the subject name at start time, so renaming/deleting a subject later
    // doesn't change or break old sessions.
    subject: { type: String, required: true, trim: true, maxlength: 30 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null }, // null while running
    durationMinutes: { type: Number, default: null, min: 0 }, // set on stop; may be fractional
    status: { type: String, enum: SESSION_STATUS, default: 'active' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Fast "my sessions, newest first" / "my sessions today" queries.
sessionSchema.index({ userId: 1, startTime: -1 });

// ⭐ The database itself guarantees ONE active session per user:
// a unique index that only applies to documents with status 'active' (a "partial" index).
// If two "Start" requests arrive at the same moment, the second insert fails with a duplicate-key error.
sessionSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' }, name: 'one_active_session_per_user' },
);

// Lets the auto-stop job quickly find active sessions that started long ago.
sessionSchema.index({ status: 1, startTime: 1 });

export const Session = mongoose.model('Session', sessionSchema);
