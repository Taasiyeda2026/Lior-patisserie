-- Lior's Pâtisserie Supabase schema
-- Run in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  price text,
  image_url text,
  is_active boolean default true,
  display_order int default 0,
  updated_at timestamp with time zone default now()
);

create table if not exists public.site_features (
  id uuid primary key default gen_random_uuid(),
  title text,
  text text,
  image_url text,
  is_active boolean default true,
  display_order int default 0,
  updated_at timestamp with time zone default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  alt_text text,
  is_active boolean default true,
  display_order int default 0,
  updated_at timestamp with time zone default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists site_features_set_updated_at on public.site_features;
create trigger site_features_set_updated_at
before update on public.site_features
for each row execute function public.set_updated_at();

drop trigger if exists gallery_images_set_updated_at on public.gallery_images;
create trigger gallery_images_set_updated_at
before update on public.gallery_images
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.site_features enable row level security;
alter table public.gallery_images enable row level security;

-- ── Public read (the static site on GitHub Pages) ──────────────────────────

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Public read active site_features" on public.site_features;
create policy "Public read active site_features"
on public.site_features for select
to anon, authenticated
using (true);

drop policy if exists "Public read active gallery_images" on public.gallery_images;
create policy "Public read active gallery_images"
on public.gallery_images for select
to anon, authenticated
using (true);

-- ── Remove old temporary anon write policies ───────────────────────────────

drop policy if exists "Temporary anon write site_settings"  on public.site_settings;
drop policy if exists "Temporary anon write products"       on public.products;
drop policy if exists "Temporary anon write site_features"  on public.site_features;
drop policy if exists "Temporary anon write gallery_images" on public.gallery_images;

-- ── Authenticated write policies (admin only) ──────────────────────────────

drop policy if exists "Authenticated write site_settings" on public.site_settings;
create policy "Authenticated write site_settings"
on public.site_settings for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated write products" on public.products;
create policy "Authenticated write products"
on public.products for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated write site_features" on public.site_features;
create policy "Authenticated write site_features"
on public.site_features for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated write gallery_images" on public.gallery_images;
create policy "Authenticated write gallery_images"
on public.gallery_images for all
to authenticated
using (true)
with check (true);

-- ── Storage bucket ─────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = excluded.public;

-- Public read for all uploaded images (needed by the public site).
drop policy if exists "Public read site-images" on storage.objects;
create policy "Public read site-images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-images');

-- Remove old temporary anon storage write policies.
drop policy if exists "Temporary anon upload site-images" on storage.objects;
drop policy if exists "Temporary anon update site-images" on storage.objects;

-- Authenticated upload / update / delete (admin only).
drop policy if exists "Authenticated upload site-images" on storage.objects;
create policy "Authenticated upload site-images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-images');

drop policy if exists "Authenticated update site-images" on storage.objects;
create policy "Authenticated update site-images"
on storage.objects for update
to authenticated
using (bucket_id = 'site-images')
with check (bucket_id = 'site-images');

drop policy if exists "Authenticated delete site-images" on storage.objects;
create policy "Authenticated delete site-images"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-images');
