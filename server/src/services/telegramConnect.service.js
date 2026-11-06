// "Connect Telegram" for supporters, and the webhook Telegram calls when someone messages our bot.
//
// Flow: supporter taps "Connect Telegram" → we create a one-time code and give them
//   https://t.me/<bot>?start=<code>  → Telegram opens the bot → they press Start →
//   Telegram sends "/start <code>" to our webhook → we save their chat ID on the link.
import { env } from '../config/env.js';
import { SupportLink } from '../models/SupportLink.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { generateLinkToken } from '../utils/codes.js';
import { sendTelegramMessage } from './telegram.service.js';

const CONNECT_CODE_TTL_MS = 60 * 60 * 1000; // the t.me link works for 1 hour
const OPEN = ['pending', 'active']; // Telegram can be connected while waiting for acceptance too

async function findSupporterLinkOr404(supporter, linkId) {
  const link = await SupportLink.findOne({ _id: linkId, supporterId: supporter.id, status: { $in: OPEN } });
  if (!link) throw new AppError(404, 'Link not found');
  return link;
}

/** Creates a fresh t.me deep link for this link. */
export async function createConnectLink(supporter, linkId) {
  const link = await findSupporterLinkOr404(supporter, linkId);
  link.telegramConnectCode = generateLinkToken();
  link.telegramConnectExpiresAt = new Date(Date.now() + CONNECT_CODE_TTL_MS);
  await link.save();
  return {
    deepLink: `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${link.telegramConnectCode}`,
    expiresAt: link.telegramConnectExpiresAt,
  };
}

/** Stops Telegram messages for this ONE link. */
export async function disconnect(supporter, linkId) {
  const link = await findSupporterLinkOr404(supporter, linkId);
  link.telegramChatId = null;
  link.telegramConnectedAt = undefined;
  link.telegramConnectCode = undefined;
  link.telegramConnectExpiresAt = undefined;
  await link.save();
  return { message: 'Telegram disconnected' };
}

/**
 * Handles one update from Telegram (https://core.telegram.org/bots/api#update).
 * We only care about text messages. Never throws — Telegram would keep retrying.
 */
export async function handleTelegramUpdate(update) {
  const message = update?.message;
  const chatId = message?.chat?.id;
  if (!chatId || typeof message.text !== 'string') return;

  // "/start <code>" (also "/start@MyBot <code>" in groups)
  const match = message.text.trim().match(/^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{16,64})$/);
  if (!match) {
    await sendTelegramMessage(
      chatId,
      '👋 Hi! I send Study Buddy updates to supporters.\nTo connect, open Study Buddy (as a supporter) and tap "Connect Telegram".',
    );
    return;
  }

  const link = await SupportLink.findOneAndUpdate(
    { telegramConnectCode: match[1], telegramConnectExpiresAt: { $gt: new Date() }, status: { $in: OPEN } },
    {
      $set: { telegramChatId: String(chatId), telegramConnectedAt: new Date() },
      $unset: { telegramConnectCode: 1, telegramConnectExpiresAt: 1 }, // single use
    },
    { returnDocument: 'after' },
  );

  if (!link) {
    await sendTelegramMessage(chatId, '⚠️ This connect link has expired or was already used. Open Study Buddy and tap "Connect Telegram" again.');
    return;
  }

  // Connect once, reuse everywhere: give the same chat to this supporter's other open links that have none.
  await SupportLink.updateMany(
    { supporterId: link.supporterId, status: { $in: OPEN }, telegramChatId: null },
    { $set: { telegramChatId: String(chatId), telegramConnectedAt: new Date() } },
  );

  const student = await User.findById(link.studentId).select('name').lean();
  const studentName = student?.name ?? 'your student';
  await sendTelegramMessage(
    chatId,
    link.status === 'active'
      ? `✅ Connected! You'll get Study Buddy updates about ${studentName} here.`
      : `✅ Connected! Once ${studentName} accepts your request, you'll get their study updates here.`,
  );
}
