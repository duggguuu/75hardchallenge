-- ============================================================
--  75 Hard · together  —  Supabase setup
--  Paste this whole file into  Supabase → SQL Editor → Run.
-- ============================================================

-- 1. Basic info, one row per person -------------------------
create table if not exists public.profiles (
  name         text primary key,          -- 'Duggu' or 'Pumpkin'
  display_name text,
  start_date   date,
  why          text,
  diet_plan    text,
  book         text,
  updated_at   timestamptz default now()
);

-- 2. Every task, every day, per person ----------------------
create table if not exists public.entries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,               -- 'Duggu' or 'Pumpkin'
  day        int  not null check (day between 1 and 75),
  task       text not null,               -- workout1 | workout2 | diet | water | reading | photo
  completed  boolean default false,
  details    text,
  photo_url  text,
  updated_at timestamptz default now(),
  unique (name, day, task)
);

-- 3. Row Level Security -------------------------------------
--    This is a private tracker for two friends sharing a link,
--    so we allow the public (anon) key full access. Anyone who
--    has your site URL can read/write — fine for two people,
--    but don't put anything secret here. (See README to lock down.)
alter table public.profiles enable row level security;
alter table public.entries  enable row level security;

drop policy if exists "open profiles" on public.profiles;
drop policy if exists "open entries"  on public.entries;
create policy "open profiles" on public.profiles for all using (true) with check (true);
create policy "open entries"  on public.entries  for all using (true) with check (true);

-- 4. Realtime — push changes to every open browser ----------
alter publication supabase_realtime add table public.entries;
alter publication supabase_realtime add table public.profiles;

-- 5. Photo storage ------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "read photos"   on storage.objects;
drop policy if exists "write photos"  on storage.objects;
drop policy if exists "update photos" on storage.objects;
create policy "read photos"   on storage.objects for select using (bucket_id = 'photos');
create policy "write photos"  on storage.objects for insert with check (bucket_id = 'photos');
create policy "update photos"  on storage.objects for update using (bucket_id = 'photos');

-- Done. Two friends, seventy-five days, zero excuses. 🔥
