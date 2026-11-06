// /api/telegram/webhook — Telegram calls this whenever someone messages our bot.
// Security: when we register the webhook we give Telegram a secret; Telegram sends it back in the
// X-Telegram-Bot-Api-Secret-Token header on every call. Anyone else gets 401.
import { Router } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { safeEqual } from '../utils/safeCompare.js';
import { handleTelegramUpdate } from '../services/telegramConnect.service.js';

export const telegramRouter = Router();

telegramRouter.post('/webhook', async (req, res) => {
  if (!safeEqual(req.get('x-telegram-bot-api-secret-token'), env.TELEGRAM_WEBHOOK_SECRET)) {
    throw new AppError(401, 'Unauthorized');
  }
  try {
    await handleTelegramUpdate(req.body);
  } catch (error) {
    // Always answer 200: otherwise Telegram keeps re-sending the same update.
    console.error(`[telegram] webhook error: ${error.message}`);
  }
  res.json({ ok: true });
});
