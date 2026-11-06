// Door guard #1: "Are you logged in?"
// Reads the JWT from the cookie, checks its signature, then LOADS THE USER FROM THE DATABASE.
// (So a deleted account stops working immediately, even if its token hasn't expired yet.)
// On success: req.user = { id, name, email, role }
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../utils/authCookie.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    throw new AppError(401, 'Please log in to continue');
  }

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch {
    // Tampered, expired, or signed with an old secret
    throw new AppError(401, 'Your login has expired. Please log in again.');
  }

  if (!mongoose.isValidObjectId(payload.sub)) {
    throw new AppError(401, 'Please log in again');
  }

  const user = await User.findById(payload.sub).lean();
  if (!user) {
    throw new AppError(401, 'Please log in again');
  }

  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    onboardingCompleted: Boolean(user.onboardingCompletedAt),
  };
  next();
}
