-- Run this in the Supabase SQL editor to add a priority field.

alter table bugs add column if not exists priority text not null default 'medium'
  check (priority in ('high', 'medium', 'low'));
