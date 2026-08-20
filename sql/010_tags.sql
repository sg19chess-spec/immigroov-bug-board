-- Run this in the Supabase SQL editor.
-- Adds a free-form tags array to bugs, with a GIN index for filtering.

alter table bugs add column if not exists tags text[] not null default '{}';

create index if not exists bugs_tags_idx on bugs using gin (tags);
