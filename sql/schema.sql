-- Run this in the Supabase SQL editor for this project.

create table if not exists bugs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  screenshot_urls text[] not null default '{}',
  status text not null default 'yet_to_review'
    check (status in ('yet_to_review', 'in_progress', 'completed')),
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  issue_type text not null default 'bug'
    check (issue_type in ('bug', 'feature_request')),
  ref_id text unique,
  reported_by text,
  handled_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create index if not exists bugs_status_idx on bugs (status);

-- keep updated_at current on every row update
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists bugs_set_updated_at on bugs;
create trigger bugs_set_updated_at
  before update on bugs
  for each row
  execute function set_updated_at();

-- enable Realtime for live board updates across viewers
alter publication supabase_realtime add table bugs;

-- Storage: create a public bucket named "bug-screenshots" via
-- Dashboard > Storage > New bucket (toggle "Public bucket" on).
-- No RLS/policy setup needed for a public bucket.
