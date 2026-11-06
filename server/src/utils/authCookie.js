// Everything about the login cookie in one place.
import jwt from 'jsonwebtoken';
import { env, isProduction } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'sb_token';

function baseCookieOptions() {
  return {
    httpOnly: true, // browser JavaScript can't read it → safe from XSS token theft
    secure: isProduction, // HTTPS-only in production (localhost is plain http)
    sameSite: 'lax', // not sent on cross-site POSTs → protects against CSRF
    path: '/',
  };
}

/** Creates a signed JWT for this user. It contains ONLY the user id ("sub" = subject). */
export function createAuthToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/** Checks the signature + expiry. Returns the payload, or throws if invalid/expired. */
export function verifyAuthToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
}

export function setAuthCookie(res, token) {
  // Make the cookie expire at exactly the same moment as the token inside it.
  const { exp } = jwt.decode(token);
  res.cookie(AUTH_COOKIE_NAME, token, { ...baseCookieOptions(), expires: new Date(exp * 1000) });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions());
}
