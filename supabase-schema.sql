-- HARI UDAAN CRM Supabase setup
-- Run this in Supabase SQL Editor before using real Supabase persistence.

create table if not exists public.crm_app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.crm_app_state (id, data)
values ('hari-udaan-2026', '{"awardees":[],"users":[],"credentials":{}}'::jsonb)
on conflict (id) do nothing;

alter table public.crm_app_state enable row level security;

drop policy if exists "crm_app_state_service_role_all" on public.crm_app_state;
create policy "crm_app_state_service_role_all"
on public.crm_app_state
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Fallback persistence for the hosted CRM when server-side service-role env is unavailable.
-- This lets the browser read/write the single shared CRM state row with the anon key.
drop policy if exists "crm_app_state_anon_shared_state" on public.crm_app_state;
create policy "crm_app_state_anon_shared_state"
on public.crm_app_state
for all
to anon
using (id = 'hari-udaan-2026')
with check (id = 'hari-udaan-2026');

grant usage on schema public to anon;
grant select, insert, update on public.crm_app_state to anon;

-- If you want to reset all CRM records later, run:
-- update public.crm_app_state
-- set data = '{"awardees":[],"users":[],"credentials":{}}'::jsonb,
--     updated_at = now()
-- where id = 'hari-udaan-2026';

-- Auth users are managed in Supabase Authentication.
-- Current initial admin: admin@haridc.com
