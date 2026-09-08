# 75 Hard · together 🔥

A private, real-time 75 Hard tracker for two people (Duggu & Pumpkin). Each day
has the six tasks — Workout 1, Workout 2 (steps), Diet, Water, Reading and a
progress photo — with a cover photo at the top of each person's page, a live
head-to-head scoreboard, progress bars everywhere, six themes in light and dark,
and a 75-day wall. Anything either of you logs shows up on the other's screen
within a second.

**Stack:** Vite + React + Framer Motion (the site, hosted on Vercel) · Supabase
(database, realtime and photo storage). Both are free.

---

## ⚠️ If you're upgrading from v1 — do this first

Open **Supabase → SQL Editor → New query**, paste in **`supabase-migration.sql`**
from this folder and hit **Run**. It's additive and safe to run twice.

It adds:

- `profiles.cover_url`, `profiles.cover_pos`, `profiles.tagline` — the cover photo
- `entries.data` (jsonb) — exercises, steps, meals, water and pages
- a `days` table — the calendar date of each day, and exception days

Until you run it the site still works, but the new sections can't save and a
banner will tell you so.

---

## What's in it

**Free day navigation.** Move to any day, any time, in either direction — the
arrows, the wall, or the ← → keys. Nothing is gated on finishing a day. When you
reopen the app it lands on today (worked out from your start date), or on the
furthest day you've actually touched.

**Workout 1 — an exercise list.** The **+** button under the card adds an
exercise with its sets and reps. Tick them off individually; the section bar
tracks how many are done, and the task checks itself when the last one is ticked.

**Workout 2 — steps.** Type the number, or tap +500 / +1,000 / +2,500. The goal
is editable (10,000 by default) and the task completes itself when you reach it.

**Diet — meals with photos.** The **+** button adds a breakfast, lunch, dinner or
snack, with a description and a photo. You can attach or replace a photo on any
meal afterwards.

**Water and reading** are counters against a target (1 gallon, 10 pages), so
their progress bars mean something.

**Cover photos.** The top of each person's page is their photo. Tap **Add photo**
/ **Change** to upload one and **Adjust** to slide the framing up and down — it
saves as you go and your partner sees it live.

**Dates and exception days.** Tap the date under the day number to set the exact
calendar date, or flag the day as an **exception** with a note (travelling, ill,
whatever). Exception days don't break your streak and are left out of every
total — the wall shows them hatched, and the counts read "8 / 74 days".

**Progress, everywhere.** A bar and a percentage on every section, on the day,
and on the challenge as a whole — plus a head-to-head bar at the top that says
who's ahead.

**Themes.** Six of them — Ember, Glass, Forest, Ocean, Sunset and Mono — each
with a light and a dark palette, plus an Auto setting that follows your phone.
The palette icon in the top bar. Your choice is remembered per device.

---

## Setting it up from scratch (about 15 minutes)

### 1. Supabase (the backend)

1. Go to **supabase.com**, sign in, create a new project. Any name, any database
   password (you won't need it again). Wait ~2 min for it to spin up.
2. **SQL Editor → New query**, paste the whole of `supabase-schema.sql`, **Run**.
   That creates the tables, the photo bucket and turns on realtime.
3. **Project Settings → Data API** (older UI: **API**). Copy two values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`

### 2. Run it locally (optional)

```bash
npm install
cp .env.example .env.local   # then paste your two keys in
npm run dev                  # http://localhost:5173
```

### 3. Deploy to Vercel

1. Push this folder to GitHub.
2. **vercel.com → Add New → Project** → import the repo. Vercel auto-detects
   Vite. If the repo has this app in a subfolder, set **Root Directory** to
   `75hard-together`.
3. Before deploying, add both environment variables under **Environment
   Variables** (tick Production).
4. **Deploy**, then send the link to Pumpkin. She taps **I'm Pumpkin**, you tap
   **I'm Duggu**, and you're both live.

> Added the env variables *after* the first deploy? Hit **Redeploy** so they take
> effect.

---

## How it works

- **Who you are** is remembered in your browser. You edit your own log and can
  watch your partner's live, but theirs stays read-only so nobody fat-fingers
  the other person's day.
- **Streaks** follow the real 75 Hard rule — consecutive fully-complete days from
  Day 1 — except that exception days are stepped over rather than counted or
  failed.
- **The wall** is green for a complete day, tinted for a partial one, hatched for
  an exception. Tap any square to jump to it.
- **Photos** go to Supabase Storage and appear as thumbnails; tap to enlarge.
- **Animations** are Framer Motion throughout, and respect
  `prefers-reduced-motion`.

## A note on privacy

This is built for two friends sharing one link, so the database is open to anyone
with your Supabase anon key (which ships in the site's code — normal for this
kind of app). Don't store anything sensitive. To lock it to just the two of you,
the clean upgrade is Supabase Auth (magic link) plus per-user RLS policies.

## Changing the names

The two people are set in `src/lib/constants.js`:

```js
export const PEOPLE = ['Duggu', 'Pumpkin']
```

Their colours live in `src/themes.css` as `--duggu` / `--pumpkin` (and
`--on-duggu` / `--on-pumpkin`, the text colour used on top of them) in each of
the twelve palettes.
