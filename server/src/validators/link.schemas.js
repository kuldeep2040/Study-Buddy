import { z } from 'zod';
import { objectId } from './common.schemas.js';

// The alphabet used for invite codes — no 0/O/1/I so codes are easy to read and type.
export const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_LENGTH = 8;

export const redeemSchema = z.object({
  code: z
    .string({ error: 'Please enter the invite code' })
    // Be forgiving: "abcd-efgh", " ABCD EFGH " → "ABCDEFGH"
    .transform((value) => value.replace(/[\s-]/g, '').toUpperCase())
    .pipe(
      z
        .string()
        .length(INVITE_CODE_LENGTH, { error: `The invite code has ${INVITE_CODE_LENGTH} characters` })
        .regex(new RegExp(`^[${INVITE_CODE_ALPHABET}]+$`), { error: 'That is not a valid invite code' }),
    ),
});

export const linkParamsSchema = z.object({ linkId: objectId('link id') });

export const studentParamsSchema = z.object({ studentId: objectId('student id') });
