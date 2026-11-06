// Compares a secret in "constant time": it takes equally long whether the first or the last
// character is wrong, so attackers can't guess a secret piece by piece by timing responses.
// Hashing first makes both values the same length (timingSafeEqual requires that).
import { createHash, timingSafeEqual } from 'node:crypto';

const sha256 = (value) => createHash('sha256').update(String(value ?? '')).digest();

export function safeEqual(provided, expected) {
  return timingSafeEqual(sha256(provided), sha256(expected));
}
