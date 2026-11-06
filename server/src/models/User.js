// A person who can log in — either a student or a supporter (one users collection for both).
import mongoose from 'mongoose';

export const ROLES = ['student', 'supporter'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    // The bcrypt hash — NEVER the real password. `select: false` = not returned by queries
    // unless we explicitly ask for it with .select('+passwordHash') (only the login code does).
    passwordHash: { type: String, required: true, select: false },
    // Chosen at signup. `immutable` = Mongoose refuses to change it after the user is created.
    role: { type: String, enum: ROLES, required: true, immutable: true },
    // Set when the user finishes (or skips through) onboarding. null = show onboarding.
    onboardingCompletedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
    toJSON: {
      // Shapes what gets sent to the browser when we res.json(user)
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // belt and braces
        ret.onboardingCompleted = Boolean(ret.onboardingCompletedAt);
        return ret;
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);
