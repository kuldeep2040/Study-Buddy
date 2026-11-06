# 📚 Study Buddy

A friendly study companion: the student tracks study time, stays focused and sees his progress. Linked supporters get Telegram updates and a **read-only** dashboard. Everything that is shared is shown clearly in the app.

- `client/`: React + Vite + Tailwind (PWA), deployed to **Vercel**
- `server/`: Node.js + Express + MongoDB (Mongoose), deployed to **Render**

See [CLAUDE.md](CLAUDE.md) for the full design: data model, API, security rules and roadmap.

## Requirements

- Node.js **20 or newer** (`node -v`)
- A free MongoDB Atlas cluster and a Telegram bot (setup guide comes in Phase 1, Block B)

## 1. Install

```bash
cd server && npm install
cd ../client && npm install
```

## 2. Configure environment variables

```bash
cp server/.env.example server/.env    # then fill in real values
cp client/.env.example client/.env    # optional: defaults are fine
```

`.env` files hold secrets and are git-ignored. Never commit them.

## 3. Run in development (two terminals)

```bash
# Terminal 1: API on http://localhost:5000
cd server && npm run dev

# Terminal 2: app on http://localhost:5173
cd client && npm run dev
```

Open http://localhost:5173. The client calls `/api/...`, and Vite's dev proxy forwards it to the server.

Quick check that the API is up: http://localhost:5000/api/health

## 4. Build for production

```bash
cd client && npm run build     # output in client/dist
cd client && npm run preview   # serve the build locally
cd server && npm start         # run the API without nodemon
```

## 5. Deploy

- **Render** (server): Root Directory `server`, Build `npm install`, Start `npm start`, then add the env vars from `server/.env.example`.
- **Vercel** (client): Root Directory `client`, Framework Vite. Put your Render URL into `client/vercel.json`.
- **cron-job.org**: `POST /api/jobs/auto-stop` every 15 minutes with header `x-cron-secret`.

A detailed step-by-step deployment guide comes at the end of Phase 1.
