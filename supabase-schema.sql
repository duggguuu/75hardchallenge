-- ============================================================
--  75 Hard · together  —  Supabase setup (v2)
--  Fresh project? Paste this whole file into
--  Supabase → SQL Editor → Run.
--
--  Already running v1? Run `supabase-migration.sql` instead —
--  it only adds what's new and leaves your data alone.
--  (Running this file on an existing project is also safe:
--   every statement is idempotent.)
-- ============================================================

-- 1. Basic info, one row per person -------------------------
create table if not exists public.profiles (
  name         text primary key,          -- 'Duggu' or 'Pumpkin'
  display_name text,
  tagline      text,                      -- shows under the cover photo
  start_date   date,                      -- drives the calendar date of each day
  why          text,
  diet_plan    text,
  book         text,
  cover_url    text,                      -- the big photo at the top of their page
  cover_pos    int default 50,            -- vertical framing of that photo, 0-100
  updated_at   timestamptz default now()
);

-- for projects created before v2
alter table public.profiles add column if not exists tagline   text;
alter table public.profiles add column if not exists cover_url text;
alter table public.profiles add column if not exists cover_pos int default 50;

-- 2. Every task, every day, per person ----------------------
--    `data` holds the structured extras:
--      workout1 -> { exercises: [{id, name, sets, reps, done}] }
--      workout2 -> { steps, goal }
--      diet     -> { meals: [{id, type, name, photo_url}] }
--      water    -> { value, goal }
--      reading  -> { value, goal }
create table if not exists public.entries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,               -- 'Duggu' or 'Pumpkin'
  day        int  not null check (day between 1 and 75),
  task       text not null,               -- workout1 | workout2 | diet | water | reading | photo
  completed  boolean default false,
  details    text,
  photo_url  text,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique (name, day, task)
);

alter table public.entries add column if not exists data jsonb not null default '{}'::jsonb;

-- 3. Per-day calendar date and exception days ---------------
--    An exception day is one you deliberately skip. It doesn't
--    break the streak and it's left out of the totals.
create table if not exists public.days (
  name         text not null,
  day          int  not null check (day between 1 and 75),
  date         date,
  is_exception boolean default false,
  note         text,
  updated_at   timestamptz default now(),
  primary key (name, day)
);

-- 4. Row Level Security -------------------------------------
--    This is a private tracker for two friends sharing a link,
--    so we allow the public (anon) key full access. Anyone who
--    has your site URL can read/write — fine for two people,
--    but don't put anything secret here. (See README to lock down.)
alter table public.profiles enable row level security;
alter table public.entries  enable row level security;
alter table public.days     enable row level security;

drop policy if exists "open profiles" on public.profiles;
drop policy if exists "open entries"  on public.entries;
drop policy if exists "open days"     on public.days;
create policy "open profiles" on public.profiles for all using (true) with check (true);
create policy "open entries"  on public.entries  for all using (true) with check (true);
create policy "open days"     on public.days     for all using (true) with check (true);

-- 5. Realtime — push changes to every open browser ----------
do $$
begin
  alter publication supabase_realtime add table public.entries;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.days;
exception when duplicate_object then null;
end $$;

-- 6. Photo storage ------------------------------------------
--    Holds progress photos, meal photos and the two cover photos.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "read photos"   on storage.objects;
drop policy if exists "write photos"  on storage.objects;
drop policy if exists "update photos" on storage.objects;
create policy "read photos"   on storage.objects for select using (bucket_id = 'photos');
create policy "write photos"  on storage.objects for insert with check (bucket_id = 'photos');
create policy "update photos" on storage.objects for update using (bucket_id = 'photos');

-- Done. Two friends, seventy-five days, zero excuses. 🔥
