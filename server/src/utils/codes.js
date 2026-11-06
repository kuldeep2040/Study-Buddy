// Random codes. crypto = cryptographically secure randomness (unguessable), unlike Math.random().
import { randomBytes, randomInt } from 'node:crypto';
import { INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH } from '../validators/link.schemas.js';

/** Short human-typed invite code, e.g. "K7QM2XPA" (alphabet has no 0/O/1/I). */
export function generateInviteCode() {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

/** Long code that is never typed (it travels inside a t.me link). 32 URL-safe characters. */
export function generateLinkToken() {
  return randomBytes(24).toString('base64url');
}
