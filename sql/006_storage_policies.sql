-- Run this in the Supabase SQL editor.
-- Allows the anon role to upload/read/update/delete screenshots in the
-- "bug-screenshots" storage bucket (this app has no auth, internal tool).

drop policy if exists "bug_screenshots_anon_select" on storage.objects;
create policy "bug_screenshots_anon_select" on storage.objects
  for select to anon
  using (bucket_id = 'bug-screenshots');

drop policy if exists "bug_screenshots_anon_insert" on storage.objects;
create policy "bug_screenshots_anon_insert" on storage.objects
  for insert to anon
  with check (bucket_id = 'bug-screenshots');

drop policy if exists "bug_screenshots_anon_update" on storage.objects;
create policy "bug_screenshots_anon_update" on storage.objects
  for update to anon
  using (bucket_id = 'bug-screenshots')
  with check (bucket_id = 'bug-screenshots');

drop policy if exists "bug_screenshots_anon_delete" on storage.objects;
create policy "bug_screenshots_anon_delete" on storage.objects
  for delete to anon
  using (bucket_id = 'bug-screenshots');
