// Connects Mongoose to MongoDB Atlas.
import mongoose from 'mongoose';
import { env } from './env.js';
import '../models/index.js'; // registers all models so syncIndexes() knows every index

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000, // give up after 15s instead of hanging forever
  });

  // Make the indexes in MongoDB match exactly what our schemas declare
  // (e.g. the "only one active session per user" rule).
  await mongoose.syncIndexes();

  console.info(`✅ MongoDB connected (database "${mongoose.connection.name}")`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
