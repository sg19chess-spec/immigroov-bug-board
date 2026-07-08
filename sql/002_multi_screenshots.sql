-- Run this in the Supabase SQL editor to switch from a single
-- screenshot_url to multiple screenshot_urls.

alter table bugs add column if not exists screenshot_urls text[] not null default '{}';

update bugs
set screenshot_urls = array[screenshot_url]
where screenshot_url is not null and screenshot_urls = '{}';

alter table bugs drop column if exists screenshot_url;
