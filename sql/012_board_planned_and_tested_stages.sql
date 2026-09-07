-- Run this in the Supabase SQL editor.
-- Adds "planned" (between yet_to_review and in_progress) and "tested"
-- (between to_be_tested and completed) stages, and a permanent
-- stage-change history table for bugs/feature requests ("tasks").

alter table bugs drop constraint if exists bugs_status_check;
alter table bugs add constraint bugs_status_check
  check (status in ('yet_to_review', 'planned', 'in_progress', 'to_be_tested', 'tested', 'completed'));

create table if not exists task_stage_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references bugs(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by text,
  changed_at timestamptz not null default now()
);

create index if not exists task_stage_history_task_id_idx on task_stage_history (task_id);

alter table task_stage_history enable row level security;

-- History is append-only: allow anon to read/insert, never update/delete.
drop policy if exists "task_stage_history_anon_select" on task_stage_history;
create policy "task_stage_history_anon_select" on task_stage_history for select to anon using (true);

drop policy if exists "task_stage_history_anon_insert" on task_stage_history;
create policy "task_stage_history_anon_insert" on task_stage_history for insert to anon with check (true);

alter publication supabase_realtime add table task_stage_history;

-- Backfill: seed one history row per existing bug so "time in first stage"
-- and "Last Stage Change" are computable right away.
insert into task_stage_history (task_id, from_stage, to_stage, changed_by, changed_at)
select id, null, status, null, created_at
from bugs
where not exists (
  select 1 from task_stage_history where task_stage_history.task_id = bugs.id
);
