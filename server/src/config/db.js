// Connects Mongoose to MongoDB Atlas.
import mongoose from 'mongoose';
import { env } from './env.js';
import '../models/index.js'; // registers all models so syncIndexes() knows every index
import { SupportLink } from '../models/SupportLink.js';

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000, // give up after 15s instead of hanging forever
  });

  // Make the indexes in MongoDB match exactly what our schemas declare
  // (e.g. the "only one active session per user" rule).
  await mongoose.syncIndexes();
  await activateLegacyRequests();

  console.info(`✅ MongoDB connected (database "${mongoose.connection.name}")`);
}

/**
 * One-time data fix (2026-11-06): the "student accepts/declines" step was removed, so requests that
 * were still waiting become active links (the student sees "X is now your supporter").
 * Safe to run on every start: once nothing is 'pending', it changes nothing.
 */
async function activateLegacyRequests() {
  const result = await SupportLink.updateMany(
    { status: 'pending' },
    { $set: { status: 'active', activatedAt: new Date(), joinedNoticeSeen: false } },
  );
  if (result.modifiedCount > 0) console.info(`ℹ️ Activated ${result.modifiedCount} waiting supporter request(s)`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
