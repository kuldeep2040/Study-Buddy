// HTTP layer for auth: read validated input → call the service → set cookie → respond.
import * as authService from '../services/auth.service.js';
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie.js';

export async function signup(req, res) {
  const { user, token } = await authService.signup(req.valid.body);
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

export async function login(req, res) {
  const { user, token } = await authService.login(req.valid.body);
  setAuthCookie(res, token);
  res.json({ user });
}

export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
}

export function me(req, res) {
  // req.user was loaded from the database by requireAuth
  res.json({ user: req.user });
}
