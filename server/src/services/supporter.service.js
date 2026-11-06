// What a SUPPORTER sees. Read-only, and built field by field (never raw student documents).
import { SupportLink } from '../models/SupportLink.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { getTodaySummary } from './session.service.js';
import { getOrCreateSettings } from './settings.service.js';
import { listNotices } from './link.service.js';

/**
 * Supporter dashboard:
 *   students → ACTIVE links, each with today's summary
 *   notices  → old "X declined / removed you" messages not dismissed yet (legacy: students can't
 *              decline or remove anymore, but such messages may still exist from before)
 */
export async function getSupporterDashboard(supporter) {
  const [links, notices] = await Promise.all([
    SupportLink.find({ supporterId: supporter.id, status: 'active' }).populate('studentId', 'name').sort({ activatedAt: -1 }).lean(),
    listNotices(supporter),
  ]);

  const students = await Promise.all(
    links
      .filter((link) => link.studentId) // skip deleted accounts
      .map(async (link) => ({
        ...(await buildStudentOverview({ id: link.studentId._id.toString(), name: link.studentId.name })),
        linkId: link._id.toString(),
        linkedAt: link.activatedAt,
        telegramConnected: Boolean(link.telegramChatId),
      })),
  );

  return { students, notices };
}

/** Read-only view of ONE student. Only call after requireLinkedStudent has checked the link! */
export async function getStudentOverview(studentId, linkId) {
  const [student, link] = await Promise.all([
    User.findById(studentId).lean(),
    SupportLink.findById(linkId).select('telegramChatId').lean(),
  ]);
  if (!student) throw new AppError(404, 'Student not found');
  return {
    ...(await buildStudentOverview({ id: student._id.toString(), name: student.name })),
    linkId,
    telegramConnected: Boolean(link?.telegramChatId),
  };
}

/**
 * Today's data a supporter may see. Every field here must be listed in the student's
 * "What your supporters can see" card (client SharingInfoCard) — transparency rule.
 */
async function buildStudentOverview(student) {
  const [today, settings] = await Promise.all([getTodaySummary(student), getOrCreateSettings(student.id)]);
  const running = today.sessions.find((s) => s.status === 'active');
  const lastFinished = today.sessions.find((s) => s.status !== 'active'); // sessions are newest first
  return {
    studentId: student.id,
    name: student.name,
    date: today.date,
    todayTotalMinutes: today.totalMinutes,
    dailyGoalMinutes: settings.dailyGoalMinutes, // shared since the redesign (owner OK'd, 2026-11-06)
    activeSession: running ? { subject: running.subject, startTime: running.startTime } : null,
    lastSession: lastFinished
      ? {
          subject: lastFinished.subject,
          startTime: lastFinished.startTime,
          endTime: lastFinished.endTime,
          durationMinutes: lastFinished.durationMinutes,
        }
      : null,
  };
}
