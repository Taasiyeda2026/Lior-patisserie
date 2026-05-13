-- Lior's Pâtisserie — Admin users and write-role hardening
-- Run this in the Supabase SQL Editor for existing projects.
-- Important: create matching Supabase Auth users separately with strong passwords:
--   username lior  -> lior.patisserie@outlook.com
--   username tomer -> tomer@lior-patisserie.com
-- Passwords must stay in Supabase Auth only and must not be committed to Git.

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

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;

drop policy if exists "Admin users read own row" on public.admin_users;
create policy "Admin users read own row"
on public.admin_users for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

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
