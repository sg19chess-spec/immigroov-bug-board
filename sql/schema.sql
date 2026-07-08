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
  reported_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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
