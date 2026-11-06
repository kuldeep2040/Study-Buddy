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
const OPEN = ['active']; // links that can have Telegram (a list, so it's easy to extend)

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
 * We only care about text messages. (The webhook route catches any error and still answers 200,
 * because Telegram would otherwise keep re-sending the same update.)
 */
export async function handleTelegramUpdate(update) {
  const reply = await replyToUpdate(update);
  if (reply) await sendTelegramMessage(reply.chatId, reply.text);
}

/** "✅ You're already connected…" if this chat already gets updates, otherwise null. */
async function alreadyConnectedText(chatId) {
  const links = await SupportLink.find({ telegramChatId: String(chatId), status: { $in: OPEN } })
    .populate('studentId', 'name')
    .lean();
  if (links.length === 0) return null;
  const names = [...new Set(links.map((l) => l.studentId?.name).filter(Boolean))].join(', ');
  return `✅ You're already connected. You get Study Buddy updates about ${names} here.\nNothing else to do!`;
}

/**
 * Decides what to do with one Telegram message and returns the bot's reply { chatId, text }
 * (or null to stay silent). Kept separate from sending so it can be tested without Telegram.
 */
export async function replyToUpdate(update) {
  const message = update?.message;
  const chatId = message?.chat?.id;
  if (!chatId || typeof message.text !== 'string') return null;

  // "/start <code>" (also "/start@MyBot <code>" in groups)
  const match = message.text.trim().match(/^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{16,64})$/);
  if (!match) {
    // A plain "/start" or any other text: no code, so we can't tell which student it's about.
    const text =
      (await alreadyConnectedText(chatId)) ??
      '👋 Hi! I send Study Buddy updates to supporters.\nTo connect, open Study Buddy (as a supporter) and tap "Connect Telegram".';
    return { chatId, text };
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
    // Usually a second press of Start (or an older link) AFTER connecting worked — don't alarm them.
    const text =
      (await alreadyConnectedText(chatId)) ??
      '⚠️ This connect link has expired or was already used. Open Study Buddy and tap "Connect Telegram" again.';
    return { chatId, text };
  }

  // Connect once, reuse everywhere: give the same chat to this supporter's other open links that have none.
  await SupportLink.updateMany(
    { supporterId: link.supporterId, status: { $in: OPEN }, telegramChatId: null },
    { $set: { telegramChatId: String(chatId), telegramConnectedAt: new Date() } },
  );

  const student = await User.findById(link.studentId).select('name').lean();
  const studentName = student?.name ?? 'your student';
  return {
    chatId,
    text:
      link.status === 'active'
        ? `✅ Connected! You'll get Study Buddy updates about ${studentName} here.\nNothing else to do!`
        : `✅ Connected! Once ${studentName} accepts your request, you'll get their study updates here.`,
  };
}
