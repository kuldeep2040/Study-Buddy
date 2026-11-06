// Business logic for accounts: creating users and checking passwords.
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { AppError } from '../utils/AppError.js';
import { createAuthToken } from '../utils/authCookie.js';

// "Cost factor": how much work hashing takes. 12 ≈ a quarter-second — slow for attackers, fine for us.
const BCRYPT_ROUNDS = 12;

// A real bcrypt hash of a random string. Used when the email doesn't exist, so login takes the
// same time either way and attackers can't discover which emails are registered by timing it.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-just-for-timing', BCRYPT_ROUNDS);

export async function signup({ name, email, password, role }) {
  if (await User.exists({ email })) {
    throw new AppError(409, 'An account with this email already exists. Try logging in.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role });

  // Students get their own settings (default subjects). Supporters don't need any.
  if (role === 'student') {
    try {
      await Settings.create({ userId: user._id });
    } catch (error) {
      // Don't leave a half-created account behind.
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  return { user: user.toJSON(), token: createAuthToken(user._id) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  const passwordOk = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !passwordOk) {
    // Same message for "no such email" and "wrong password" — don't reveal which one.
    throw new AppError(401, 'Invalid email or password');
  }

  return { user: user.toJSON(), token: createAuthToken(user._id) };
}
