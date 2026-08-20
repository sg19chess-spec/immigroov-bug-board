-- Run this in the Supabase SQL editor.
-- Adds a "to_be_tested" stage between "in_progress" and "completed".

alter table bugs drop constraint if exists bugs_status_check;
alter table bugs add constraint bugs_status_check
  check (status in ('yet_to_review', 'in_progress', 'to_be_tested', 'completed'));
