-- ============================================================
--  75 Hard · together  —  v2 migration
--  Run this ONCE in Supabase → SQL Editor → Run.
--  It is additive and safe to run more than once.
-- ============================================================

-- 1. Cover photo + focal point on each profile ---------------
alter table public.profiles add column if not exists cover_url text;
alter table public.profiles add column if not exists cover_pos int default 50;
alter table public.profiles add column if not exists tagline   text;

-- 2. Structured payload on every entry -----------------------
--    workout1 -> { exercises: [{id, name, sets, reps, done}] }
--    workout2 -> { steps, goal }
--    diet     -> { meals: [{id, type, name, photo_url}] }
--    water    -> { value, goal }
--    reading  -> { value, goal }
alter table public.entries add column if not exists data jsonb not null default '{}'::jsonb;

-- 3. Per-day calendar date + "exception" (rest / skipped) day
create table if not exists public.days (
  name         text not null,             -- 'Duggu' or 'Pumpkin'
  day          int  not null check (day between 1 and 75),
  date         date,
  is_exception boolean default false,
  note         text,
  updated_at   timestamptz default now(),
  primary key (name, day)
);

alter table public.days enable row level security;
drop policy if exists "open days" on public.days;
create policy "open days" on public.days for all using (true) with check (true);

-- 4. Realtime for the new table ------------------------------
do $$
begin
  alter publication supabase_realtime add table public.days;
exception when duplicate_object then null;
end $$;

-- Done. Reload the site. 🔥
