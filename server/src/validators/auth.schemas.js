// zod schemas = the exact shape we accept for auth requests, with friendly error messages.
import { z } from 'zod';
import { ROLES } from '../models/User.js';

// Trim + lowercase FIRST, then check it's an email (so " Ravi@Gmail.com " is accepted as ravi@gmail.com).
const email = z
  .string({ error: 'Please enter your email' })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Please enter a valid email address' }).max(254));

export const signupSchema = z.object({
  name: z
    .string({ error: 'Please enter your name' })
    .trim()
    .min(1, { error: 'Please enter your name' })
    .max(50, { error: 'Name must be at most 50 characters' }),
  email,
  password: z
    .string({ error: 'Please enter a password' })
    .min(8, { error: 'Password must be at least 8 characters' })
    // bcrypt only looks at the first 72 bytes of a password, so we cap it there.
    .max(72, { error: 'Password must be at most 72 characters' }),
  role: z.enum(ROLES, { error: 'Please choose whether you are a student or a supporter' }),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'Please enter your password' }).min(1, { error: 'Please enter your password' }),
});
