-- Lior's Pâtisserie — Supabase schema (site + admin, no gallery)
-- Run in the Supabase SQL Editor.
--
-- For existing projects that still have public.gallery_images, run cleanup-gallery.sql
-- once before or after this script (safe to run either order).
--
-- Security note: write policies are restricted to active rows in public.admin_users.
-- Create Supabase Auth users separately with strong passwords; never store passwords here.

create extension if not exists "pgcrypto";

-- ── Tables ─────────────────────────────────────────────────────────────────

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default now()
);

create table if not exists public.admin_users (
  username text primary key,
  email text unique not null,
  is_active boolean default true,
  updated_at timestamp with time zone default now()
);

insert into public.admin_users (username, email, is_active, updated_at) values
  ('lior', 'lior.patisserie@outlook.com', true, now()),
  ('tomer', 'tomer@lior-patisserie.com', true, now())
on conflict (username) do update
set email = excluded.email,
    is_active = excluded.is_active;

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

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.is_active = true
      and lower(au.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
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
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.site_features enable row level security;

-- ── Public read (anon + authenticated) ────────────────────────────────────

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admin users read own row" on public.admin_users;
create policy "Admin users read own row"
on public.admin_users for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

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
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Authenticated write products" on public.products;
create policy "Authenticated write products"
on public.products for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Authenticated write site_features" on public.site_features;
create policy "Authenticated write site_features"
on public.site_features for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

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
with check (bucket_id = 'site-images' and public.is_admin_user());

drop policy if exists "Authenticated update site-images" on storage.objects;
create policy "Authenticated update site-images"
on storage.objects for update
to authenticated
using (bucket_id = 'site-images' and public.is_admin_user())
with check (bucket_id = 'site-images' and public.is_admin_user());

drop policy if exists "Authenticated delete site-images" on storage.objects;
create policy "Authenticated delete site-images"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-images' and public.is_admin_user());

-- ── Remove deprecated gallery table (safe if already absent) ───────────────

drop table if exists public.gallery_images cascade;
