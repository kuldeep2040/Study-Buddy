// ALL Telegram code lives here. Nothing else in the app talks to Telegram directly.
//
// Golden rule: Telegram problems must NEVER break the app. Every function here catches its own
// errors, logs a short message (never the token), and carries on.
import { env } from '../config/env.js';
import { SupportLink } from '../models/SupportLink.js';
import { formatIstTime } from '../utils/time.js';
import { formatDuration, formatHoursMinutes } from '../utils/format.js';

const TELEGRAM_TIMEOUT_MS = 8000; // don't wait forever if Telegram is slow

/**
 * Sends one plain-text message. Returns true if Telegram accepted it, false otherwise.
 * Never throws.
 */
export async function sendTelegramMessage(chatId, text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      console.error(`[telegram] send failed (HTTP ${response.status}): ${data.description || 'no details'}`);
      return false;
    }
    return true;
  } catch (error) {
    // Network error or timeout. error.message never contains the URL/token for fetch errors.
    const reason = error.name === 'TimeoutError' ? `timed out after ${TELEGRAM_TIMEOUT_MS}ms` : error.message;
    console.error(`[telegram] send failed: ${reason}`);
    return false;
  }
}

/**
 * Which chats should hear about this student? Every ACTIVE link that has connected Telegram.
 * (Ended links get nothing.) `distinct` = each chat only once, even if listed twice.
 */
async function getRecipientChatIds(studentId) {
  return SupportLink.distinct('telegramChatId', { studentId, status: 'active', telegramChatId: { $ne: null } });
}

/** Sends to ONE link's supporter, if they connected Telegram. Never throws. */
async function notifyLinkSupporter(link, text) {
  if (link?.telegramChatId) await sendTelegramMessage(link.telegramChatId, text);
}

async function notifySupporters(studentId, text) {
  try {
    const chatIds = await getRecipientChatIds(studentId);
    await Promise.all(chatIds.map((chatId) => sendTelegramMessage(chatId, text)));
  } catch (error) {
    console.error(`[telegram] could not notify supporters: ${error.message}`);
  }
}

// --- Message templates (wording from the product spec) ---

export function notifySessionStarted(student, session) {
  const pomodoro = session.mode === 'pomodoro' ? ` (Pomodoro, ${session.pomodoro.focusMinutes}-min focus rounds)` : '';
  return notifySupporters(
    student.id,
    `📚 ${student.name} started studying ${session.subject} at ${formatIstTime(session.startTime)} IST${pomodoro}`,
  );
}

export function notifySessionPaused(student, session, studiedMinutes) {
  return notifySupporters(student.id, `⏸️ ${student.name} paused ${session.subject} after ${formatDuration(studiedMinutes)} of study`);
}

export function notifySessionResumed(student, session) {
  return notifySupporters(student.id, `▶️ ${student.name} is back to ${session.subject}`);
}

export function notifyBreakStarted(student, session, round, breakMinutes) {
  return notifySupporters(
    student.id,
    `☕ ${student.name} finished focus round ${round} of ${session.subject} and is taking a ${Math.round(breakMinutes)}-min break`,
  );
}

export function notifyBreakEnded(student, session, round) {
  return notifySupporters(student.id, `🎯 ${student.name} started focus round ${round} of ${session.subject}`);
}

export function notifySessionStopped(student, session, todayTotalMinutes) {
  return notifySupporters(
    student.id,
    `✅ ${student.name} finished ${session.subject}. Studied ${formatDuration(session.durationMinutes)}. ` +
      `Today's total: ${formatHoursMinutes(todayTotalMinutes)}`,
  );
}

export function notifyLinkStarted(link, studentName) {
  return notifyLinkSupporter(link, `🎉 You're now following ${studentName}. You'll get their study updates here.`);
}

export function notifySessionAutoStopped(student, session) {
  const why =
    session.autoStopReason === 'long-pause'
      ? 'ended automatically after a pause of over an hour'
      : `was auto-stopped after ${env.AUTO_STOP_HOURS} hours of study`;
  return notifySupporters(
    student.id,
    `⏹️ ${student.name}'s ${session.subject} session ${why}. Studied ${formatDuration(session.durationMinutes)}.`,
  );
}
