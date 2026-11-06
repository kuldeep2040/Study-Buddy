// The connection between ONE student and ONE supporter (many-to-many overall).
//
// Lifecycle (owner's decision 2026-11-06: no accept/decline, and only the supporter can end a link):
//   student creates invite      → 'invited' { inviteCode, inviteExpiresAt }        (auto-deleted after 24h)
//   supporter enters the code   → 'active'  { supporterId, activatedAt }            (supporter can see data)
//   supporter stops following   → 'revoked' { endedBy: 'supporter', endedAt }       (kept for history)
// The student sees "X is now your supporter" once (joinedNoticeSeen) and "X stopped following" once (noticeSeen).
//
// 'pending' and 'declined' are LEGACY (the old accept/decline flow). No code creates them anymore;
// they stay in the enum so old documents remain valid. Old pending links are made active at startup (db.js).
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

    requestedAt: { type: Date }, // legacy: when a supporter sent a request in the old flow
    activatedAt: { type: Date }, // supporter entered the code (= linked)
    // false = the student hasn't dismissed "X is now your supporter" yet. No default on purpose:
    // links made before this field existed have no value, so they don't suddenly show a message.
    joinedNoticeSeen: { type: Boolean },

    // Ending
    endedBy: { type: String, enum: ['student', 'supporter'] }, // 'student' only on legacy links
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

// The same pair can't have two OPEN links — but can link again after it ended. ('pending' is legacy;
// it stays in the filter so the existing index in MongoDB doesn't have to be rebuilt.)
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
