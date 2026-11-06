// Business logic for study sessions: start, pause/resume, Pomodoro breaks, stop, auto-stop, today.
// All "how long / which phase" maths lives in utils/sessionClock.js (shared with the browser).
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { getIstDayRange, toIstDateString } from '../utils/time.js';
import { MAX_PAUSE_MS, breakLengthMs, sessionClock } from '../utils/sessionClock.js';
import { SupportLink } from '../models/SupportLink.js';
import { findSubjectName } from './subject.service.js';
import { getOrCreateSettings } from './settings.service.js';
import * as telegram from './telegram.service.js';

const MAX_STUDY_MS = env.AUTO_STOP_HOURS * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * Runs a notification WITHOUT making the user wait for it.
 * The API responds immediately; the Telegram message is sent in the background.
 * (The telegram service never throws, but .catch() is an extra safety net.)
 */
function inBackground(promise) {
  promise.catch((error) => console.error(`[background] ${error.message}`));
}

const asStudent = (user) => ({ id: user._id?.toString() ?? user.id, name: user.name });

/**
 * Should this running session be ended automatically? Two rules (owner's decision):
 *   'long-pause' → a pause has lasted over an hour (for a Pomodoro break: an hour AFTER the break
 *                  was over) — he probably walked away. It ends when the pause began.
 *   'limit'      → 4 hours of actual study (pauses don't count) — he probably forgot to press Stop.
 * Returns { endTime, reason } or null.
 */
function autoStopDecision(session, nowMs) {
  const clock = sessionClock(session, nowMs);
  // A break that should have started but isn't saved yet counts as an open break.
  const pause = clock.openPause ?? (clock.pendingBreakAtMs && { reason: 'break', startMs: clock.pendingBreakAtMs });
  if (pause) {
    const allowedMs = MAX_PAUSE_MS + (pause.reason === 'break' ? breakLengthMs(session.pomodoro, clock.round) : 0);
    if (nowMs - pause.startMs > allowedMs) return { endTime: new Date(pause.startMs), reason: 'long-pause' };
  }
  if (clock.studiedMs >= MAX_STUDY_MS) {
    // The moment study time reached 4h (we don't credit anything after that).
    const endMs = pause ? pause.startMs : nowMs - (clock.studiedMs - MAX_STUDY_MS);
    return { endTime: new Date(endMs), reason: 'limit' };
  }
  return null;
}

/**
 * Ends an active session — the ONE place that decides how a session ends.
 * Normally endTime = now and status 'completed'; if an auto-stop rule applies, it's 'auto-stopped'
 * at the moment the rule says. Any open pause/break is closed at endTime, and durationMinutes is
 * the STUDY time (pauses and breaks excluded).
 *
 * The filter { status: 'active' } makes this safe if two requests try to close the same session
 * at once (e.g. the Stop button and the auto-stop job): only ONE update matches; the other gets null.
 */
async function closeSession(session, now = new Date()) {
  const nowMs = now.getTime();
  const plain = session.toObject();
  const clock = sessionClock(plain, nowMs);
  // A focus round that finished unnoticed: its break started then, so save that break first.
  if (clock.pendingBreakAtMs) plain.pauses.push({ start: new Date(clock.pendingBreakAtMs), end: null, reason: 'break' });

  const decision = autoStopDecision(plain, nowMs);
  const endTime = decision ? decision.endTime : now;
  const pauses = plain.pauses
    .filter((p) => p.start <= endTime)
    .map((p) => (p.end == null || p.end > endTime ? { ...p, end: endTime } : p));
  const studiedMs = sessionClock({ ...plain, pauses, endTime }, endTime.getTime()).studiedMs;

  return Session.findOneAndUpdate(
    { _id: session._id, status: 'active' },
    {
      $set: {
        endTime,
        pauses,
        durationMinutes: Math.min(studiedMs, MAX_STUDY_MS) / MINUTE_MS,
        status: decision ? 'auto-stopped' : 'completed',
        ...(decision && { autoStopReason: decision.reason }),
      },
    },
    { returnDocument: 'after' }, // return the updated document (not the old one)
  );
}

/**
 * Pomodoro: if a focus round has finished but its break isn't saved yet, save the break now
 * (starting at the exact moment the round ended) and tell the supporters.
 * The filter on the pauses count makes it safe if two requests do this at the same moment.
 */
async function saveFinishedRoundBreak(student, session, nowMs) {
  const clock = sessionClock(session, nowMs);
  if (!clock.pendingBreakAtMs) return session;

  const updated = await Session.findOneAndUpdate(
    { _id: session._id, status: 'active', pauses: { $size: session.pauses.length } },
    { $push: { pauses: { start: new Date(clock.pendingBreakAtMs), end: null, reason: 'break' } } },
    { returnDocument: 'after' },
  );
  if (!updated) return (await Session.findById(session._id)) ?? session; // someone else saved it first
  inBackground(telegram.notifyBreakStarted(student, updated, clock.round, breakLengthMs(updated.pomodoro, clock.round) / MINUTE_MS));
  return updated;
}

/** Minutes studied in a session so far (running sessions count up to now, capped at 4h). */
function minutesOf(session, now) {
  if (session.status === 'active') return Math.min(sessionClock(session, now.getTime()).studiedMs, MAX_STUDY_MS) / MINUTE_MS;
  return session.durationMinutes || 0;
}

/**
 * The student's running session, brought up to date first: auto-stopped if a rule applies
 * (then null is returned), and a finished Pomodoro round's break saved.
 * Called whenever we read the active session, so the app is correct even if the external
 * cron job hasn't run yet (or is broken).
 */
async function getActiveSessionDoc(student, now = new Date()) {
  const active = await Session.findOne({ userId: student.id, status: 'active' });
  if (!active) return null;

  if (autoStopDecision(active.toObject(), now.getTime())) {
    const closed = await closeSession(active, now);
    if (closed) inBackground(telegram.notifySessionAutoStopped(student, closed));
    return null;
  }
  return saveFinishedRoundBreak(student, active, now.getTime());
}

// ---------------------------------------------------------------------------

export async function getActiveSession(student) {
  const active = await getActiveSessionDoc(student);
  return active ? active.toJSON() : null;
}

/** mode 'pomodoro' copies the student's current Pomodoro settings onto the session. */
export async function startSession(student, requestedSubject, mode = 'normal') {
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
    session = await Session.create({
      userId: student.id,
      subject,
      mode,
      pomodoro: mode === 'pomodoro' ? settings.pomodoro.toObject() : null,
      startTime: new Date(),
    });
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

/** Pause the running focus time. The session stays open (status 'active'). */
export async function pauseSession(student) {
  const now = new Date();
  const active = await getActiveSessionDoc(student, now);
  if (!active) throw new AppError(404, 'There is no running session to pause');

  const { openPause } = sessionClock(active, now.getTime());
  if (openPause) throw new AppError(409, openPause.reason === 'break' ? "You're on a break right now" : 'The session is already paused');

  // Only add a pause if none is open (protects against a double-tap).
  const updated = await Session.findOneAndUpdate(
    { _id: active._id, status: 'active', pauses: { $not: { $elemMatch: { end: null } } } },
    { $push: { pauses: { start: now, end: null, reason: 'manual' } } },
    { returnDocument: 'after' },
  );
  if (!updated) throw new AppError(409, 'The session is already paused');

  inBackground(telegram.notifySessionPaused(student, updated, minutesOf(updated, now)));
  return updated.toJSON();
}

/** Resume after a pause, or start the next Pomodoro round after a break. */
export async function resumeSession(student) {
  const now = new Date();
  const active = await getActiveSessionDoc(student, now);
  if (!active) throw new AppError(404, 'There is no running session to resume');

  const open = active.pauses.find((p) => p.end == null);
  if (!open) throw new AppError(409, "The session isn't paused");

  // Close exactly that pause (arrayFilters picks the array item to change).
  const updated = await Session.findOneAndUpdate(
    { _id: active._id, status: 'active', pauses: { $elemMatch: { _id: open._id, end: null } } },
    { $set: { 'pauses.$[open].end': now } },
    { arrayFilters: [{ 'open._id': open._id }], returnDocument: 'after' },
  );
  if (!updated) throw new AppError(409, "The session isn't paused");

  if (open.reason === 'break') {
    inBackground(telegram.notifyBreakEnded(student, updated, sessionClock(updated, now.getTime()).round));
  } else {
    inBackground(telegram.notifySessionResumed(student, updated));
  }
  return updated.toJSON();
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
  await getActiveSessionDoc(student, now); // auto-stop / save a finished round's break first

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
 * Used by the cron job (POST /api/jobs/auto-stop, every 15 min): for EVERY running session,
 * applies the auto-stop rules and saves finished Pomodoro breaks (so supporters get the
 * Telegram message even if the student's app is closed). Returns how many were closed.
 */
export async function autoStopExpiredSessions(now = new Date()) {
  // Nothing can need action within the first hour, so skip sessions younger than that.
  const candidates = await Session.find({ status: 'active', startTime: { $lte: new Date(now.getTime() - MAX_PAUSE_MS) } });
  const roundCandidates = await Session.find({ status: 'active', mode: 'pomodoro', startTime: { $gt: new Date(now.getTime() - MAX_PAUSE_MS) } });

  let closedCount = 0;
  for (const session of [...candidates, ...roundCandidates]) {
    const user = await User.findById(session.userId).lean();
    const student = user ? asStudent(user) : null;

    if (autoStopDecision(session.toObject(), now.getTime())) {
      const closed = await closeSession(session, now);
      if (!closed) continue; // already closed by someone else
      closedCount += 1;
      // Awaited here (not background): the job has no user waiting, and we want messages sent before it returns.
      if (student) await telegram.notifySessionAutoStopped(student, closed);
    } else if (student) {
      await saveFinishedRoundBreak(student, session, now.getTime());
    }
  }
  return closedCount;
}
