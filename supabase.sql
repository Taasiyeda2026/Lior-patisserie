-- Lior's Pâtisserie — Supabase schema (site + admin, no gallery)
-- Run in the Supabase SQL Editor.
--
-- For existing projects that still have public.gallery_images, run cleanup-gallery.sql
-- once before or after this script (safe to run either order).
--
-- Security note: write policies allow any authenticated Supabase Auth user. If you add
-- more users later, tighten policies (e.g. restrict to admin email or a custom claim).

create extension if not exists "pgcrypto";

-- ── Tables ─────────────────────────────────────────────────────────────────

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
  card_image_url text,
  is_active boolean default true,
  display_order int default 0,
  updated_at timestamp with time zone default now()
);

alter table public.products add column if not exists card_image_url text;
alter table public.products add column if not exists price text;
alter table public.products add column if not exists product_series text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_product_series_check'
  ) then
    alter table public.products
    add constraint products_product_series_check
    check (product_series is null or product_series in ('series_1', 'series_2', 'series_3', 'none'));
  end if;
end;
$$;

-- Check for duplicate product names before adding the unique constraint.
select name, count(*)
from public.products
group by name
having count(*) > 1;

-- Add the unique name constraint only when the table is already clean.
do $$
begin
  if exists (
    select 1
    from (
      select name
      from public.products
      group by name
      having count(*) > 1
    ) duplicate_products
  ) then
    raise notice 'products_name_unique was not added because duplicate product names exist. Clean public.products first.';
  elsif not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_name_unique'
  ) then
    alter table public.products
    add constraint products_name_unique unique (name);
  end if;
end;
$$;

create table if not exists public.site_features (
  id uuid primary key default gen_random_uuid(),
  title text,
  text text,
  image_url text,
  is_active boolean default true,
  display_order int default 0,
  updated_at timestamp with time zone default now()
);

-- ── updated_at trigger helper ───────────────────────────────────────────────

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

-- ── Row Level Security ─────────────────────────────────────────────────────

alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.site_features enable row level security;

-- ── Public read (anon + authenticated) ────────────────────────────────────

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings"
on public.site_settings for select
to anon, authenticated
using (true);

-- Drop legacy policy names if present
drop policy if exists "Public read active products" on public.products;
drop policy if exists "Public read products" on public.products;
create policy "Public read products"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Public read active site_features" on public.site_features;
drop policy if exists "Public read site_features" on public.site_features;
create policy "Public read site_features"
on public.site_features for select
to anon, authenticated
using (true);

-- ── Remove legacy temporary anon write (tables) ────────────────────────────

drop policy if exists "Temporary anon write site_settings" on public.site_settings;
drop policy if exists "Temporary anon write products" on public.products;
drop policy if exists "Temporary anon write site_features" on public.site_features;

-- ── Authenticated write (admin session) ───────────────────────────────────
-- See security note at top before relying on this in multi-user projects.

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

-- ── Storage: bucket site-images ───────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read site-images" on storage.objects;

drop policy if exists "Temporary anon upload site-images" on storage.objects;
drop policy if exists "Temporary anon update site-images" on storage.objects;

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

-- ── Remove deprecated gallery table (safe if already absent) ───────────────

drop table if exists public.gallery_images cascade;
