// Builds the Express app: middleware first, then routes, then error handling.
// It does NOT start listening — index.js does that. Keeping them separate makes the app easier to test later.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Render sits behind a proxy; this lets Express see the real protocol (https) and client IP.
app.set('trust proxy', 1);

// --- Middleware (runs on every request, top to bottom) ---
app.use(helmet()); // safe HTTP headers
app.use(
  cors({
    origin: env.CLIENT_URL, // only our frontend may call the API from a browser…
    credentials: true, // …and it may send cookies
  }),
);
app.use(express.json({ limit: '10kb' })); // parse JSON bodies; small limit = no huge payloads
app.use(cookieParser()); // fills req.cookies

// --- Routes ---
app.use('/api', apiRouter);

// --- Errors (must be LAST) ---
app.use(notFound); // nothing matched → 404
app.use(errorHandler); // any thrown error → clean JSON response
