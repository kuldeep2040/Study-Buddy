// Student ↔ supporter links: invite → request → accept/decline → end. See models/SupportLink.js.
import { SupportLink } from '../models/SupportLink.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { generateInviteCode } from '../utils/codes.js';
import * as telegram from './telegram.service.js';

const INVITE_TTL_MS = 24 * 60 * 60 * 1000; // invite codes work for 24 hours
const ENDED = ['declined', 'revoked'];

function inBackground(promise) {
  promise.catch((error) => console.error(`[background] ${error.message}`));
}

/** "Unseen messages about links the OTHER side ended", for the given side. */
function noticeFilter(user) {
  return user.role === 'student'
    ? { studentId: user.id, endedBy: 'supporter', status: { $in: ENDED }, noticeSeen: false }
    : { supporterId: user.id, endedBy: 'student', status: { $in: ENDED }, noticeSeen: false };
}

/** Notices in the shape the app shows: { linkId, kind, name, endedAt }. */
export async function listNotices(user) {
  const otherSide = user.role === 'student' ? 'supporterId' : 'studentId';
  const links = await SupportLink.find(noticeFilter(user)).populate(otherSide, 'name').sort({ endedAt: -1 }).lean();
  return links.map((link) => ({
    linkId: link._id.toString(),
    kind: link.status === 'declined' ? 'declined' : link.activatedAt ? 'ended' : 'cancelled',
    name: link[otherSide]?.name ?? 'Someone',
    endedAt: link.endedAt,
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
  const [open, invite, notices] = await Promise.all([
    SupportLink.find({ studentId: student.id, status: { $in: ['pending', 'active'] } })
      .populate('supporterId', 'name email')
      .sort({ updatedAt: -1 })
      .lean(),
    SupportLink.findOne({ studentId: student.id, status: 'invited', inviteExpiresAt: { $gt: new Date() } }).lean(),
    listNotices(student),
  ]);

  const view = (link) => ({
    linkId: link._id.toString(),
    supporterName: link.supporterId.name,
    supporterEmail: link.supporterId.email, // so the student knows EXACTLY who it is
    telegramConnected: Boolean(link.telegramChatId), // transparency: does this person get Telegram messages?
  });
  const withSupporter = open.filter((link) => link.supporterId); // skip deleted accounts

  return {
    supporters: withSupporter.filter((l) => l.status === 'active').map((l) => ({ ...view(l), linkedAt: l.activatedAt })),
    requests: withSupporter.filter((l) => l.status === 'pending').map((l) => ({ ...view(l), requestedAt: l.requestedAt })),
    pendingInvite: invite ? { linkId: invite._id.toString(), code: invite.inviteCode, expiresAt: invite.inviteExpiresAt } : null,
    notices,
  };
}

/** Student accepts a supporter's request → the link becomes active. */
export async function acceptRequest(student, linkId) {
  const link = await SupportLink.findOneAndUpdate(
    { _id: linkId, studentId: student.id, status: 'pending' },
    { $set: { status: 'active', activatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!link) throw new AppError(404, 'Request not found. It may have been cancelled.');
  inBackground(telegram.notifyLinkAccepted(link, student.name));
  return { message: 'Supporter added' };
}

/** Student declines → the supporter sees "X declined your request". */
export async function declineRequest(student, linkId) {
  const link = await SupportLink.findOneAndUpdate(
    { _id: linkId, studentId: student.id, status: 'pending' },
    { $set: { status: 'declined', endedBy: 'student', endedAt: new Date(), noticeSeen: false } },
  );
  if (!link) throw new AppError(404, 'Request not found. It may have been cancelled.');
  return { message: 'Request declined' };
}

// -------------------------------------------------------------- supporter side

/** A supporter enters a student's code → a PENDING request the student must accept. */
export async function redeemInvite(supporter, code) {
  const invalid = new AppError(400, 'This invite code is invalid or has expired. Ask the student for a new one.');

  // Check expiry ourselves too: MongoDB's TTL cleanup only runs about once a minute.
  const invite = await SupportLink.findOne({ inviteCode: code, status: 'invited', inviteExpiresAt: { $gt: new Date() } });
  if (!invite) throw invalid;

  const student = await User.findById(invite.studentId).lean();
  if (!student || student.role !== 'student') throw invalid;

  const existing = await SupportLink.findOne({
    studentId: invite.studentId,
    supporterId: supporter.id,
    status: { $in: ['pending', 'active'] },
  }).lean();
  if (existing) {
    // Don't use up the code.
    throw new AppError(409, existing.status === 'active' ? `You are already linked to ${student.name}` : `You already sent ${student.name} a request`);
  }

  // Connect once, reuse everywhere: if this supporter already connected Telegram on another link, reuse it.
  const withTelegram = await SupportLink.findOne({
    supporterId: supporter.id,
    status: { $in: ['pending', 'active'] },
    telegramChatId: { $ne: null },
  }).lean();

  // Atomic: only succeeds if the invite is STILL unused (two supporters can't both use one code).
  let link;
  try {
    link = await SupportLink.findOneAndUpdate(
      { _id: invite._id, status: 'invited' },
      {
        $set: {
          status: 'pending',
          supporterId: supporter.id,
          requestedAt: new Date(),
          ...(withTelegram && { telegramChatId: withTelegram.telegramChatId, telegramConnectedAt: new Date() }),
        },
        $unset: { inviteCode: 1, inviteExpiresAt: 1 },
      },
      { returnDocument: 'after' },
    );
  } catch (error) {
    if (error.code === 11000) throw new AppError(409, `You already sent ${student.name} a request`);
    throw error;
  }
  if (!link) throw invalid;

  return {
    linkId: link._id.toString(),
    status: link.status,
    telegramConnected: Boolean(link.telegramChatId),
    student: { id: student._id.toString(), name: student.name },
  };
}

// ----------------------------------------------------------------- both sides

/**
 * Ends a link. Either side can: the student ("remove this supporter" / "cancel my code") or the
 * supporter ("stop following" / "cancel my request"). The other side gets an in-app message.
 */
export async function endLink(user, linkId) {
  const isStudent = user.role === 'student';
  const link = await SupportLink.findOne({
    _id: linkId,
    [isStudent ? 'studentId' : 'supporterId']: user.id, // you can only end YOUR links
    status: { $in: isStudent ? ['invited', 'pending', 'active'] : ['pending', 'active'] },
  });
  if (!link) throw new AppError(404, 'Link not found');

  if (link.status === 'invited') {
    await link.deleteOne(); // an unused code: nobody else is involved
    return { message: 'Invite cancelled' };
  }

  const wasActive = link.status === 'active';
  link.set({
    status: 'revoked',
    endedBy: user.role,
    endedAt: new Date(),
    noticeSeen: false,
    telegramConnectCode: undefined,
    telegramConnectExpiresAt: undefined,
  });
  await link.save();

  if (isStudent && wasActive) inBackground(telegram.notifyLinkEndedByStudent(link, user.name));
  return { message: 'Link removed' };
}

/** Hides the "X ended the link" message for the user who received it. */
export async function dismissNotice(user, linkId) {
  const result = await SupportLink.updateOne({ _id: linkId, ...noticeFilter(user) }, { $set: { noticeSeen: true } });
  if (result.matchedCount === 0) throw new AppError(404, 'Notice not found');
  return { message: 'Dismissed' };
}
