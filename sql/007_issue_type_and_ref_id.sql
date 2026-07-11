-- Run this in the Supabase SQL editor.
-- Adds an issue_type (bug / feature_request) and a human-friendly,
-- auto-incrementing reference id (BUG-001, FEAT-001, ...) per type.

alter table bugs add column if not exists issue_type text not null default 'bug'
  check (issue_type in ('bug', 'feature_request'));

alter table bugs add column if not exists ref_id text unique;

create sequence if not exists bug_ref_seq start 1;
create sequence if not exists feature_ref_seq start 1;

create or replace function set_bug_ref_id()
returns trigger as $$
begin
  if new.ref_id is null then
    if new.issue_type = 'feature_request' then
      new.ref_id := 'FEAT-' || lpad(nextval('feature_ref_seq')::text, 3, '0');
    else
      new.ref_id := 'BUG-' || lpad(nextval('bug_ref_seq')::text, 3, '0');
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists bugs_set_ref_id on bugs;
create trigger bugs_set_ref_id
  before insert on bugs
  for each row
  execute function set_bug_ref_id();

-- Backfill ref_id for any existing rows that don't have one yet, ordered
-- by creation time so ids stay chronological.
do $$
declare
  r record;
begin
  for r in select id, issue_type from bugs where ref_id is null order by created_at asc loop
    if r.issue_type = 'feature_request' then
      update bugs set ref_id = 'FEAT-' || lpad(nextval('feature_ref_seq')::text, 3, '0') where id = r.id;
    else
      update bugs set ref_id = 'BUG-' || lpad(nextval('bug_ref_seq')::text, 3, '0') where id = r.id;
    end if;
  end loop;
end $$;

alter table bugs alter column ref_id set not null;
