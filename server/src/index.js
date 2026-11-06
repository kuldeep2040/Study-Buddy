// Entry point: check env → connect to MongoDB → start listening.
// We only accept requests once the database is ready.
import { env } from './config/env.js'; // validates .env first; exits with a clear message if wrong
import { app } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

try {
  await connectDB();
} catch (error) {
  // Hide the connection string, just in case a driver error ever includes it.
  const safeMessage = String(error.message).split(env.MONGODB_URI).join('[MONGODB_URI]');
  console.error(`❌ Could not connect to MongoDB: ${safeMessage}`);
  console.error('   Check MONGODB_URI in server/.env and Network Access in MongoDB Atlas.');
  process.exit(1);
}

const server = app.listen(env.PORT, () => {
  console.info(`✅ Study Buddy API running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Render sends SIGTERM when it stops/redeploys the server: finish open requests, then close the DB.
async function shutdown(signal) {
  console.info(`${signal} received — shutting down…`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
