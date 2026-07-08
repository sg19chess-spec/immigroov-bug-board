-- Run this in the Supabase SQL editor.
-- This app has no auth (internal shared-link tool), so allow the anon
-- role full read/write access to the bugs table.

alter table bugs enable row level security;

drop policy if exists "bugs_anon_select" on bugs;
create policy "bugs_anon_select" on bugs for select to anon using (true);

drop policy if exists "bugs_anon_insert" on bugs;
create policy "bugs_anon_insert" on bugs for insert to anon with check (true);

drop policy if exists "bugs_anon_update" on bugs;
create policy "bugs_anon_update" on bugs for update to anon using (true) with check (true);

drop policy if exists "bugs_anon_delete" on bugs;
create policy "bugs_anon_delete" on bugs for delete to anon using (true);
