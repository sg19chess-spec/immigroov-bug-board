-- Run this in the Supabase SQL editor.
-- Adds the "To Be Tested" testing-attempt workflow: a developer marks a
-- commit ready for testing in an environment, a tester records Pass/Fail.
-- Every attempt is kept permanently (never overwritten).

create table if not exists task_testing (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references bugs(id) on delete cascade,
  environment text not null check (environment in ('staging', 'production')),
  commit_sha text,
  commit_url text,
  assigned_tester text,
  ready_by text,
  ready_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'passed', 'failed')),
  tested_by text,
  tested_at timestamptz,
  test_notes text,
  created_at timestamptz not null default now()
);

create index if not exists task_testing_task_id_idx on task_testing (task_id);

alter table task_testing enable row level security;

drop policy if exists "task_testing_anon_select" on task_testing;
create policy "task_testing_anon_select" on task_testing for select to anon using (true);

drop policy if exists "task_testing_anon_insert" on task_testing;
create policy "task_testing_anon_insert" on task_testing for insert to anon with check (true);

-- Update is only ever used once per row, to record the Pass/Fail result.
drop policy if exists "task_testing_anon_update" on task_testing;
create policy "task_testing_anon_update" on task_testing for update to anon using (true) with check (true);

alter publication supabase_realtime add table task_testing;
