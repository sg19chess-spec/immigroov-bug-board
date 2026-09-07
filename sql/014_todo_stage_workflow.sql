-- Run this in the Supabase SQL editor.
-- Moves the To-Do list from a flat done/closed_at boolean to a
-- stage-based workflow (Assigned -> In Progress -> Completed) with
-- permanent stage-change history, mirroring the bugs board.

alter table todos rename column closed_at to completed_at;

alter table todos add column if not exists stage text not null default 'assigned'
  check (stage in ('assigned', 'in_progress', 'completed'));
alter table todos add column if not exists assigned_to text;
alter table todos add column if not exists in_progress_at timestamptz;

-- Backfill stage from the old done boolean, then drop it: stage is now
-- the single source of truth.
update todos set stage = 'completed' where done = true and stage = 'assigned';
alter table todos drop column if exists done;

create table if not exists task_todo_stage_history (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references todos(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by text,
  changed_at timestamptz not null default now()
);

create index if not exists task_todo_stage_history_todo_id_idx on task_todo_stage_history (todo_id);

alter table task_todo_stage_history enable row level security;

drop policy if exists "task_todo_stage_history_anon_select" on task_todo_stage_history;
create policy "task_todo_stage_history_anon_select" on task_todo_stage_history for select to anon using (true);

drop policy if exists "task_todo_stage_history_anon_insert" on task_todo_stage_history;
create policy "task_todo_stage_history_anon_insert" on task_todo_stage_history for insert to anon with check (true);

alter publication supabase_realtime add table task_todo_stage_history;

-- Backfill: one "assigned" row per existing todo, at creation time.
insert into task_todo_stage_history (todo_id, from_stage, to_stage, changed_by, changed_at)
select id, null, 'assigned', reported_by, created_at
from todos
where not exists (
  select 1 from task_todo_stage_history where task_todo_stage_history.todo_id = todos.id
);

-- For todos that were already completed, also backfill the closing
-- transition at their old completed_at. The historic in_progress moment
-- can't be recovered, so this approximates a direct assigned->completed
-- jump for pre-existing data only; all future transitions are exact.
insert into task_todo_stage_history (todo_id, from_stage, to_stage, changed_by, changed_at)
select id, 'assigned', 'completed', null, completed_at
from todos
where stage = 'completed' and completed_at is not null;
