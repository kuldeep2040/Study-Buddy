// Tells Telegram where our webhook lives. Run ONCE after deploying (and again if the URL changes):
//
//   npm run telegram:webhook -- https://your-app.onrender.com     → register the webhook
//   npm run telegram:webhook -- --info                             → show the current status
//   npm run telegram:webhook -- --delete                           → remove it
//
// Reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET from server/.env. Never prints them.
import { env } from '../src/config/env.js';

const arg = process.argv[2];
const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  }).then((response) => response.json());

if (!arg) {
  console.error('Usage: npm run telegram:webhook -- <https://server-url> | --info | --delete');
  process.exit(1);
}

if (arg === '--info') {
  const { result } = await api('getWebhookInfo');
  console.log({
    url: result.url || '(none)',
    pendingUpdates: result.pending_update_count,
    lastError: result.last_error_message ?? null,
  });
} else if (arg === '--delete') {
  console.log((await api('deleteWebhook')).description);
} else {
  if (!arg.startsWith('https://')) {
    console.error('The server URL must start with https:// (Telegram only calls secure URLs).');
    process.exit(1);
  }
  const url = `${arg.replace(/\/+$/, '')}/api/telegram/webhook`;
  const result = await api('setWebhook', {
    url,
    secret_token: env.TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ['message'], // we only need text messages
    drop_pending_updates: true,
  });
  console.log(result.ok ? `✅ Webhook set to ${url}` : `❌ ${result.description}`);
}
