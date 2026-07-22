-- Run this in the Supabase SQL editor to add the Tested Scenarios feature.

create table if not exists test_modules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists test_cases (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references test_modules(id) on delete cascade,
  description text not null,
  added_by text,
  tested boolean not null default false,
  tested_by text,
  created_at timestamptz default now(),
  tested_at timestamptz
);

create index if not exists test_cases_module_id_idx on test_cases (module_id);

alter table test_modules enable row level security;
alter table test_cases enable row level security;

drop policy if exists "test_modules_anon_select" on test_modules;
create policy "test_modules_anon_select" on test_modules for select to anon using (true);
drop policy if exists "test_modules_anon_insert" on test_modules;
create policy "test_modules_anon_insert" on test_modules for insert to anon with check (true);
drop policy if exists "test_modules_anon_update" on test_modules;
create policy "test_modules_anon_update" on test_modules for update to anon using (true) with check (true);
drop policy if exists "test_modules_anon_delete" on test_modules;
create policy "test_modules_anon_delete" on test_modules for delete to anon using (true);

drop policy if exists "test_cases_anon_select" on test_cases;
create policy "test_cases_anon_select" on test_cases for select to anon using (true);
drop policy if exists "test_cases_anon_insert" on test_cases;
create policy "test_cases_anon_insert" on test_cases for insert to anon with check (true);
drop policy if exists "test_cases_anon_update" on test_cases;
create policy "test_cases_anon_update" on test_cases for update to anon using (true) with check (true);
drop policy if exists "test_cases_anon_delete" on test_cases;
create policy "test_cases_anon_delete" on test_cases for delete to anon using (true);

alter publication supabase_realtime add table test_modules;
alter publication supabase_realtime add table test_cases;
