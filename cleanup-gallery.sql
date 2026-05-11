-- Gallery was removed from the site and admin. Run once in the Supabase SQL Editor
-- on databases that were created with an older schema that included public.gallery_images.
-- CASCADE drops dependent triggers and policies with the table.

drop table if exists public.gallery_images cascade;
