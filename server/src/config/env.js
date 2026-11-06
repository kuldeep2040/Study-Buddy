// Loads server/.env into process.env, then VALIDATES every variable with zod.
// If anything is missing or malformed, the server refuses to start and says which variable is wrong.
// (On Render there is no .env file — variables are set in the dashboard, and this check still runs.)
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z
    .string({ error: 'is required (MongoDB Atlas connection string)' })
    .startsWith('mongodb', { error: 'must start with mongodb:// or mongodb+srv://' }),

  JWT_SECRET: z
    .string({ error: 'is required' })
    .min(32, { error: 'must be at least 32 characters long (use the generator command in .env.example)' }),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CLIENT_URL: z.url({ error: 'must be a full URL like http://localhost:5173' }),

  TELEGRAM_BOT_TOKEN: z.string({ error: 'is required (from @BotFather)' }).min(20, { error: 'looks too short' }),
  // Used to build the "Connect Telegram" deep link: https://t.me/<username>?start=<code>
  TELEGRAM_BOT_USERNAME: z
    .string({ error: 'is required (your bot username, without @)' })
    .regex(/^[A-Za-z0-9_]{5,32}$/, { error: 'must be the bot username without @' }),
  // Telegram sends this back in a header on every webhook call, so we know it's really Telegram.
  TELEGRAM_WEBHOOK_SECRET: z
    .string({ error: 'is required (a long random string)' })
    .regex(/^[A-Za-z0-9_-]{16,256}$/, { error: 'must be 16–256 letters, numbers, _ or -' }),

  CRON_SECRET: z.string({ error: 'is required' }).min(16, { error: 'must be at least 16 characters long' }),
  AUTO_STOP_HOURS: z.coerce.number().positive().max(24).default(4),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  // Print WHICH variables are wrong and why — but never their values (they may be secrets).
  console.error('❌ Invalid or missing environment variables in server/.env:');
  for (const issue of result.error.issues) {
    console.error(`   • ${issue.path.join('.')} ${issue.message}`);
  }
  console.error('   See server/.env.example for descriptions.');
  process.exit(1);
}

export const env = result.data;
export const isProduction = env.NODE_ENV === 'production';
