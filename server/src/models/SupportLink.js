// The connection between ONE student and ONE supporter (many-to-many overall).
//
// Lifecycle:
//   student creates invite  → 'invited'  { inviteCode, inviteExpiresAt }   (auto-deleted after 24h)
//   supporter enters code   → 'pending'  { supporterId, requestedAt }      (waits for the student)
//   student accepts         → 'active'   { activatedAt }                    (supporter can see data)
//   student declines        → 'declined' { endedBy: 'student', endedAt }
//   either side ends it     → 'revoked'  { endedBy, endedAt }               (kept for history)
// After 'declined'/'revoked', the OTHER side sees a message until they dismiss it (noticeSeen).
import mongoose from 'mongoose';

export const LINK_STATUS = ['invited', 'pending', 'active', 'declined', 'revoked'];

const supportLinkSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: LINK_STATUS, default: 'invited' },

    // 'invited' only
    inviteCode: { type: String },
    inviteExpiresAt: { type: Date },

    requestedAt: { type: Date }, // supporter entered the code
    activatedAt: { type: Date }, // student accepted

    // Ending
    endedBy: { type: String, enum: ['student', 'supporter'] },
    endedAt: { type: Date },
    noticeSeen: { type: Boolean, default: false }, // the OTHER side dismissed the "link ended" message

    // Telegram (optional, per link). The connect code is put in a t.me deep link.
    telegramChatId: { type: String, default: null },
    telegramConnectedAt: { type: Date },
    telegramConnectCode: { type: String },
    telegramConnectExpiresAt: { type: Date },
  },
  { timestamps: true },
);

// The same pair can't have two OPEN links (pending or active) — but can link again after it ended.
// Also the main lookup for permission checks (requireLinkedStudent).
supportLinkSchema.index(
  { studentId: 1, supporterId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'active'] } }, name: 'one_open_link_per_pair' },
);

supportLinkSchema.index({ supporterId: 1, status: 1 }); // supporter's list of students
supportLinkSchema.index({ studentId: 1, status: 1 }); // student's list of supporters

// Find by code. `sparse` = documents WITHOUT the field are ignored by the unique rule.
supportLinkSchema.index({ inviteCode: 1 }, { unique: true, sparse: true });
supportLinkSchema.index({ telegramConnectCode: 1 }, { unique: true, sparse: true });

// TTL: MongoDB deletes the document once `inviteExpiresAt` passes. Only unused invites have
// that field (it's removed when the code is redeemed), so real links are never deleted.
supportLinkSchema.index({ inviteExpiresAt: 1 }, { expireAfterSeconds: 0 });

export const SupportLink = mongoose.model('SupportLink', supportLinkSchema, 'supportLinks');
