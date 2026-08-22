-- Run this in the Supabase SQL editor.
-- Adds a "handled by" field to track which team member is working a bug.

alter table bugs add column if not exists handled_by text;
