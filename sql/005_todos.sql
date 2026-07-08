-- Run this in the Supabase SQL editor to add the to-do list feature.

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  reported_by text,
  done boolean not null default false,
  created_at timestamptz default now(),
  closed_at timestamptz
);

alter table todos enable row level security;

drop policy if exists "todos_anon_select" on todos;
create policy "todos_anon_select" on todos for select to anon using (true);

drop policy if exists "todos_anon_insert" on todos;
create policy "todos_anon_insert" on todos for insert to anon with check (true);

drop policy if exists "todos_anon_update" on todos;
create policy "todos_anon_update" on todos for update to anon using (true) with check (true);

drop policy if exists "todos_anon_delete" on todos;
create policy "todos_anon_delete" on todos for delete to anon using (true);

alter publication supabase_realtime add table todos;
