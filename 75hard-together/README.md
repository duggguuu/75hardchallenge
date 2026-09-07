# 75 Hard · together 🔥

A private, real-time 75 Hard tracker for two people (Duggu & Pumpkin). Each day
has the six tasks — Workout 1, Workout 2, Diet, Water, Reading, Progress photo —
with notes and a photo upload on every one, a live-updating scoreboard, and a
75-day wall. Anything either of you checks off shows up on the other's screen
within a second.

**Stack:** Vite + React (the website, hosted on Vercel) · Supabase (the backend —
database, realtime, and photo storage). Both are free.

---

## What you'll do (about 15 minutes)

1. Create a Supabase project (the backend).
2. Run one SQL file to create the tables.
3. Deploy this folder to Vercel with two keys pasted in.
4. Send the link to Pumpkin.

---

### 1. Set up Supabase (backend)

1. Go to **supabase.com**, sign in, and create a new project. Pick any name and a
   database password (you won't need the password again). Wait ~2 min for it to spin up.
2. In the left sidebar open **SQL Editor** → **New query**. Open the file
   `supabase-schema.sql` from this project, paste the whole thing in, and click **Run**.
   That creates the tables, the photo bucket, and turns on realtime.
3. Open **Project Settings → Data API** (older UI: **API**). Copy two values:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon / public** key → this is your `VITE_SUPABASE_ANON_KEY`

### 2. Run it locally first (optional but nice)

```bash
npm install
cp .env.example .env      # then paste your two keys into .env
npm run dev               # open the URL it prints (usually http://localhost:5173)
```

### 3. Deploy to Vercel

1. Put this folder on GitHub (create a repo and push it).
2. Go to **vercel.com** → **Add New → Project** → import that repo.
   Vercel auto-detects Vite; you don't need to change the build settings.
3. Before you click Deploy, open **Environment Variables** and add the same two:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. You'll get a link like `your-app.vercel.app`.
5. Send it to Pumpkin. She opens it, taps **I'm Pumpkin**, you tap **I'm Duggu**,
   and you're both live.

> If you add the env variables *after* the first deploy, hit **Redeploy** so they
> take effect.

---

## How it works

- **Who you are** is remembered in your browser. You edit your own log; you can
  view your partner's log live but it stays read-only for you (so nobody
  fat-fingers the other person's day).
- **The scoreboard** shows each person's current streak — consecutive fully-complete
  days from Day 1, matching the real 75 Hard "miss one, start over" rule.
- **The wall** fills green when all six tasks for a day are done, and a lighter
  shade when some are. Tap any cell to jump to that day.
- **Photos** upload straight to Supabase Storage and appear as thumbnails; tap to
  enlarge.

## A note on privacy

This is built for two friends sharing one link, so the database is wide open to
anyone who has your Supabase anon key (which ships in the site's code — that's
normal for this kind of app). Don't store anything sensitive. If you later want
to lock it to just the two of you, the clean upgrade is Supabase Auth (magic-link
login) plus per-user RLS policies — happy to help you add that.

## Change the names

The two people are set in `src/App.jsx`:

```js
const PEOPLE = ['Duggu', 'Pumpkin']
```

Their colours (teal + pumpkin) are in `src/index.css` under `:root`.
