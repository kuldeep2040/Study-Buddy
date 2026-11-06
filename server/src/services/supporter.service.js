// What a SUPPORTER sees. Read-only, and built field by field (never raw student documents).
import { SupportLink } from '../models/SupportLink.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { getTodaySummary } from './session.service.js';
import { listNotices } from './link.service.js';

/**
 * Supporter dashboard:
 *   students → ACTIVE links, each with today's summary
 *   waiting  → requests the students haven't accepted yet (no student data shown!)
 *   notices  → "X declined / removed you" messages not dismissed yet
 */
export async function getSupporterDashboard(supporter) {
  const [links, notices] = await Promise.all([
    SupportLink.find({ supporterId: supporter.id, status: { $in: ['pending', 'active'] } })
      .populate('studentId', 'name')
      .sort({ updatedAt: -1 })
      .lean(),
    listNotices(supporter),
  ]);
  const withStudent = links.filter((link) => link.studentId); // skip deleted accounts

  const students = await Promise.all(
    withStudent
      .filter((link) => link.status === 'active')
      .map(async (link) => ({
        ...(await buildStudentOverview({ id: link.studentId._id.toString(), name: link.studentId.name })),
        linkId: link._id.toString(),
        linkedAt: link.activatedAt,
        telegramConnected: Boolean(link.telegramChatId),
      })),
  );

  const waiting = withStudent
    .filter((link) => link.status === 'pending')
    .map((link) => ({
      linkId: link._id.toString(),
      studentName: link.studentId.name,
      requestedAt: link.requestedAt,
      telegramConnected: Boolean(link.telegramChatId),
    }));

  return { students, waiting, notices };
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

/** Today's data a supporter may see. */
async function buildStudentOverview(student) {
  const today = await getTodaySummary(student);
  const running = today.sessions.find((s) => s.status === 'active');
  return {
    studentId: student.id,
    name: student.name,
    date: today.date,
    todayTotalMinutes: today.totalMinutes,
    activeSession: running ? { subject: running.subject, startTime: running.startTime } : null,
  };
}
