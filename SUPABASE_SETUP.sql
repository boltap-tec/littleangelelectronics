-- =====================================================================
-- Little Angel Electronics — Supabase setup
-- Storage model: the WHOLE app state is kept as ONE JSON row.
-- Run this once in your Supabase project:  SQL Editor → New query → paste → Run.
-- =====================================================================

-- 1) The single-row store for the whole shop's data.
create table if not exists public.app_state (
  id          text primary key,                       -- always 'main'
  data        jsonb not null default '{}'::jsonb,      -- entire app DB (users, products, purchases, sales, settings...)
  updated_at  timestamptz not null default now()
);

-- 2) Row Level Security ON (Supabase best practice)...
alter table public.app_state enable row level security;

-- 3) ...with a permissive policy so the app works with just the anon key.
--    (Fine while the page/URL is not public. Tighten later if you add real auth.)
drop policy if exists "app_state open access" on public.app_state;
create policy "app_state open access"
  on public.app_state
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 4) Enable Realtime on the table so every device gets live updates.
--    (Safe to run repeatedly — it ignores the error if it's already added.)
do $$
begin
  begin
    alter publication supabase_realtime add table public.app_state;
  exception when duplicate_object then null;
           when undefined_object  then null;   -- publication not present on very old projects
  end;
end $$;

-- 5) (Optional) create the empty 'main' row now. The app also creates it
--    automatically on first save, so this step is not required.
insert into public.app_state (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

-- Done. Now paste your Project URL + anon key into index.html (SUPABASE_URL / SUPABASE_ANON_KEY).
-- If you set this up before, just re-run step 4 once to turn on live sync.
