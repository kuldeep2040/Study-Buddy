// Student ↔ supporter links: the student creates a code → the supporter enters it and is linked
// straight away → only the supporter can end it ("stop following"). See models/SupportLink.js.
import { SupportLink } from '../models/SupportLink.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { generateInviteCode } from '../utils/codes.js';
import * as telegram from './telegram.service.js';

const INVITE_TTL_MS = 24 * 60 * 60 * 1000; // invite codes work for 24 hours
const ENDED = ['declined', 'revoked']; // 'declined' only exists on legacy links

function inBackground(promise) {
  promise.catch((error) => console.error(`[background] ${error.message}`));
}

/** "Unseen messages about links the OTHER side ended", for the given side. */
function endedNoticeFilter(user) {
  return user.role === 'student'
    ? { studentId: user.id, endedBy: 'supporter', status: { $in: ENDED }, noticeSeen: false }
    : { supporterId: user.id, endedBy: 'student', status: { $in: ENDED }, noticeSeen: false }; // legacy only
}

/** "X is now your supporter" messages the student hasn't dismissed yet. */
function joinedNoticeFilter(student) {
  return { studentId: student.id, status: 'active', joinedNoticeSeen: false };
}

function noticeKind(link) {
  if (link.status === 'active') return 'joined';
  if (link.status === 'declined') return 'declined';
  return link.activatedAt ? 'ended' : 'cancelled'; // 'cancelled' = a legacy request withdrawn before acceptance
}

/** Notices in the shape the app shows: { linkId, kind, name, at }. */
export async function listNotices(user) {
  const isStudent = user.role === 'student';
  const otherSide = isStudent ? 'supporterId' : 'studentId';
  const filter = isStudent ? { $or: [endedNoticeFilter(user), joinedNoticeFilter(user)] } : endedNoticeFilter(user);
  const links = await SupportLink.find(filter).populate(otherSide, 'name').sort({ updatedAt: -1 }).lean();
  return links.map((link) => ({
    linkId: link._id.toString(),
    kind: noticeKind(link),
    name: link[otherSide]?.name ?? 'Someone',
    at: link.endedAt ?? link.activatedAt,
  }));
}

// ---------------------------------------------------------------- student side

/** Creates a fresh invite code. Any previous unused code of this student stops working. */
export async function createInvite(student) {
  await SupportLink.deleteMany({ studentId: student.id, status: 'invited' });
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const link = await SupportLink.create({
        studentId: student.id,
        status: 'invited',
        inviteCode: generateInviteCode(),
        inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS),
      });
      return { linkId: link._id.toString(), code: link.inviteCode, expiresAt: link.inviteExpiresAt };
    } catch (error) {
      // A clash between two random codes is astronomically unlikely, but retry just in case.
      if (error.code !== 11000 || attempt === 3) throw error;
    }
  }
}

/** Everything the student should see about sharing. */
export async function listStudentLinks(student) {
  const [active, invite, notices] = await Promise.all([
    SupportLink.find({ studentId: student.id, status: 'active' })
      .populate('supporterId', 'name email')
      .sort({ activatedAt: -1 })
      .lean(),
    SupportLink.findOne({ studentId: student.id, status: 'invited', inviteExpiresAt: { $gt: new Date() } }).lean(),
    listNotices(student),
  ]);

  return {
    supporters: active
      .filter((link) => link.supporterId) // skip deleted accounts
      .map((link) => ({
        linkId: link._id.toString(),
        supporterName: link.supporterId.name,
        supporterEmail: link.supporterId.email, // so the student knows EXACTLY who it is
        telegramConnected: Boolean(link.telegramChatId), // transparency: does this person get Telegram messages?
        linkedAt: link.activatedAt,
      })),
    pendingInvite: invite ? { linkId: invite._id.toString(), code: invite.inviteCode, expiresAt: invite.inviteExpiresAt } : null,
    notices,
  };
}

// -------------------------------------------------------------- supporter side

/**
 * A supporter enters a student's code → linked straight away (ACTIVE). Creating and sharing the
 * code is the student's consent, so there is no separate accept step.
 */
export async function redeemInvite(supporter, code) {
  const invalid = new AppError(400, 'This invite code is invalid or has expired. Ask the student for a new one.');

  // Check expiry ourselves too: MongoDB's TTL cleanup only runs about once a minute.
  const invite = await SupportLink.findOne({ inviteCode: code, status: 'invited', inviteExpiresAt: { $gt: new Date() } });
  if (!invite) throw invalid;

  const student = await User.findById(invite.studentId).lean();
  if (!student || student.role !== 'student') throw invalid;

  const alreadyLinked = new AppError(409, `You are already following ${student.name}`);
  const existing = await SupportLink.exists({ studentId: invite.studentId, supporterId: supporter.id, status: 'active' });
  if (existing) throw alreadyLinked; // and don't use up the code

  // Connect once, reuse everywhere: if this supporter already connected Telegram on another link, reuse it.
  const withTelegram = await SupportLink.findOne({
    supporterId: supporter.id,
    status: 'active',
    telegramChatId: { $ne: null },
  }).lean();

  // Atomic: only succeeds if the invite is STILL unused (two supporters can't both use one code).
  let link;
  try {
    link = await SupportLink.findOneAndUpdate(
      { _id: invite._id, status: 'invited' },
      {
        $set: {
          status: 'active',
          supporterId: supporter.id,
          activatedAt: new Date(),
          joinedNoticeSeen: false, // the student gets "X is now your supporter"
          ...(withTelegram && { telegramChatId: withTelegram.telegramChatId, telegramConnectedAt: new Date() }),
        },
        $unset: { inviteCode: 1, inviteExpiresAt: 1 },
      },
      { returnDocument: 'after' },
    );
  } catch (error) {
    if (error.code === 11000) throw alreadyLinked; // the unique "one open link per pair" index
    throw error;
  }
  if (!link) throw invalid;

  inBackground(telegram.notifyLinkStarted(link, student.name)); // only if their Telegram was reused
  return {
    linkId: link._id.toString(),
    status: link.status,
    telegramConnected: Boolean(link.telegramChatId),
    student: { id: student._id.toString(), name: student.name },
  };
}

// ----------------------------------------------------------------- both sides

/**
 * DELETE /links/:id. Owner's rule: a student can only cancel an UNUSED invite code. Once a
 * supporter is linked, only the supporter can end it ("stop following"); the student then sees a message.
 */
export async function endLink(user, linkId) {
  if (user.role === 'student') {
    const deleted = await SupportLink.findOneAndDelete({ _id: linkId, studentId: user.id, status: 'invited' });
    if (deleted) return { message: 'Invite cancelled' };
    const isTheirSupporter = await SupportLink.exists({ _id: linkId, studentId: user.id, status: 'active' });
    if (isTheirSupporter) throw new AppError(403, 'Supporters can only be removed by themselves (Stop following).');
    throw new AppError(404, 'Link not found');
  }

  const link = await SupportLink.findOneAndUpdate(
    { _id: linkId, supporterId: user.id, status: { $in: ['pending', 'active'] } }, // 'pending' = legacy
    {
      $set: { status: 'revoked', endedBy: 'supporter', endedAt: new Date(), noticeSeen: false },
      $unset: { telegramConnectCode: 1, telegramConnectExpiresAt: 1 },
    },
  );
  if (!link) throw new AppError(404, 'Link not found');
  return { message: 'Stopped following' };
}

/** Hides a link message ("X is now your supporter" / "X stopped following") for the user who got it. */
export async function dismissNotice(user, linkId) {
  const ended = await SupportLink.updateOne({ _id: linkId, ...endedNoticeFilter(user) }, { $set: { noticeSeen: true } });
  if (ended.matchedCount > 0) return { message: 'Dismissed' };

  if (user.role === 'student') {
    const joined = await SupportLink.updateOne({ _id: linkId, ...joinedNoticeFilter(user) }, { $set: { joinedNoticeSeen: true } });
    if (joined.matchedCount > 0) return { message: 'Dismissed' };
  }
  throw new AppError(404, 'Notice not found');
}
