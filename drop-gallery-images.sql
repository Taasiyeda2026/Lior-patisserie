-- Remove gallery_images from an existing Supabase/Postgres database.
-- Run once in the Supabase SQL Editor (or psql) after deploying code that no longer
-- uses this table. Safe to re-run: drops policies/triggers with the table (CASCADE).

drop table if exists public.gallery_images cascade;
