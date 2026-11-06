// Business logic for study sessions: start, stop, auto-stop, today's summary.
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { getIstDayRange, toIstDateString } from '../utils/time.js';
import { SupportLink } from '../models/SupportLink.js';
import { findSubjectName } from './subject.service.js';
import { getOrCreateSettings } from './settings.service.js';
import * as telegram from './telegram.service.js';

const MAX_SESSION_MS = env.AUTO_STOP_HOURS * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * Runs a notification WITHOUT making the user wait for it.
 * The API responds immediately; the Telegram message is sent in the background.
 * (The telegram service never throws, but .catch() is an extra safety net.)
 */
function inBackground(promise) {
  promise.catch((error) => console.error(`[background] ${error.message}`));
}

/**
 * Closes an active session — the ONE place that decides how a session ends.
 * - Normally: endTime = now, status 'completed'.
 * - If it has run longer than AUTO_STOP_HOURS: endTime = startTime + 4h, status 'auto-stopped'
 *   (we don't credit time after the 4-hour mark — he probably forgot to press Stop).
 *
 * The filter { status: 'active' } makes this safe if two requests try to close the same session
 * at once (e.g. the Stop button and the auto-stop job): only ONE update matches; the other gets null.
 */
async function closeSession(session, now = new Date()) {
  const elapsedMs = now - session.startTime;
  const expired = elapsedMs >= MAX_SESSION_MS;
  const endTime = expired ? new Date(session.startTime.getTime() + MAX_SESSION_MS) : now;

  return Session.findOneAndUpdate(
    { _id: session._id, status: 'active' },
    {
      $set: {
        endTime,
        durationMinutes: (endTime - session.startTime) / MINUTE_MS,
        status: expired ? 'auto-stopped' : 'completed',
      },
    },
    { returnDocument: 'after' }, // return the updated document (not the old one)
  );
}

/** Minutes studied in a session so far (running sessions count up to now, capped at 4h). */
function minutesOf(session, now) {
  if (session.status === 'active') {
    return Math.min(now - session.startTime, MAX_SESSION_MS) / MINUTE_MS;
  }
  return session.durationMinutes || 0;
}

/**
 * If the student's active session is past the 4-hour limit, close it now and notify.
 * Called whenever we read the active session, so the app behaves correctly even if the
 * external cron job hasn't run yet (or is broken).
 * Returns the still-running session, or null.
 */
async function getActiveSessionDoc(student) {
  const active = await Session.findOne({ userId: student.id, status: 'active' });
  if (!active) return null;

  if (Date.now() - active.startTime >= MAX_SESSION_MS) {
    const closed = await closeSession(active);
    if (closed) inBackground(telegram.notifySessionAutoStopped(student, closed));
    return null;
  }
  return active;
}

// ---------------------------------------------------------------------------

export async function getActiveSession(student) {
  const active = await getActiveSessionDoc(student);
  return active ? active.toJSON() : null;
}

export async function startSession(student, requestedSubject) {
  // The subject must be one of the student's own subjects (we store its exact saved spelling).
  const subject = await findSubjectName(student.id, requestedSubject);
  if (!subject) {
    throw new AppError(400, 'Please pick one of your subjects');
  }

  if (await getActiveSessionDoc(student)) {
    throw new AppError(409, 'You already have a session running. Stop it before starting a new one.');
  }

  // Optional rule the student turned on himself: no studying until a supporter is linked.
  const settings = await getOrCreateSettings(student.id);
  if (settings.requireSupporterBeforeStudy && !(await SupportLink.exists({ studentId: student.id, status: 'active' }))) {
    throw new AppError(
      403,
      'You turned on "Require a supporter before studying". Link a supporter first, or turn it off in Settings.',
    );
  }

  let session;
  try {
    session = await Session.create({ userId: student.id, subject, startTime: new Date() });
  } catch (error) {
    // 11000 = the "one active session per user" index blocked a second one (e.g. double-tap).
    if (error.code === 11000) {
      throw new AppError(409, 'You already have a session running. Stop it before starting a new one.');
    }
    throw error;
  }

  // The session is SAVED first; Telegram happens afterwards and can't undo or block it.
  inBackground(telegram.notifySessionStarted(student, session));
  return session.toJSON();
}

export async function stopSession(student) {
  const active = await Session.findOne({ userId: student.id, status: 'active' });
  if (!active) {
    throw new AppError(404, 'There is no running session to stop');
  }

  const closed = await closeSession(active);
  if (!closed) {
    // Someone else (e.g. the auto-stop job) closed it a split second earlier.
    throw new AppError(409, 'This session was already stopped');
  }

  const [{ totalMinutes }, settings] = await Promise.all([getTodaySummary(student), getOrCreateSettings(student.id)]);

  if (closed.status === 'auto-stopped') {
    inBackground(telegram.notifySessionAutoStopped(student, closed));
  } else {
    inBackground(telegram.notifySessionStopped(student, closed, totalMinutes));
  }

  // dailyGoalMinutes lets the app show "62% of your daily goal" on the summary card.
  return { session: closed.toJSON(), todayTotalMinutes: totalMinutes, dailyGoalMinutes: settings.dailyGoalMinutes };
}

/**
 * Today's (IST) sessions, newest first, and the total minutes including a running session.
 * A session belongs to the day it STARTED on (a session from 11 pm to 1 am counts for the first day).
 */
export async function getTodaySummary(student, now = new Date()) {
  await getActiveSessionDoc(student); // closes an over-limit session first, so totals are right

  const { start, end } = getIstDayRange(now);
  const sessions = await Session.find({ userId: student.id, startTime: { $gte: start, $lt: end } }).sort({
    startTime: -1,
  });

  const totalMinutes = sessions.reduce((sum, s) => sum + minutesOf(s, now), 0);

  return {
    date: toIstDateString(now),
    totalMinutes,
    sessions: sessions.map((s) => s.toJSON()),
  };
}

/**
 * Used by the cron job (POST /api/jobs/auto-stop): closes EVERY session older than the limit.
 * Returns how many were closed.
 */
export async function autoStopExpiredSessions(now = new Date()) {
  const cutoff = new Date(now.getTime() - MAX_SESSION_MS);
  const expired = await Session.find({ status: 'active', startTime: { $lte: cutoff } });

  let closedCount = 0;
  for (const session of expired) {
    const closed = await closeSession(session, now);
    if (!closed) continue; // already closed by someone else

    closedCount += 1;
    const student = await User.findById(closed.userId).lean();
    if (student) {
      // Awaited here (not background): the job has no user waiting, and we want messages sent before it returns.
      await telegram.notifySessionAutoStopped({ id: student._id.toString(), name: student.name }, closed);
    }
  }
  return closedCount;
}
