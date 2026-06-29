create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text,
  store_name text,
  phone text,
  created_at timestamp with time zone default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  need text,
  budget numeric,
  status text default 'Mới',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists tiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tile_code text not null,
  tile_name text not null,
  size text,
  surface text,
  main_color text,
  price_per_m2 numeric,
  stock_m2 numeric,
  image_url text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  tile_id uuid references tiles(id) on delete set null,
  project_name text not null,
  room_type text,
  style text,
  room_image_url text,
  tile_image_url text,
  result_image_url text,
  advice_text text,
  status text default 'Bản nháp',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  tile_id uuid references tiles(id) on delete set null,
  area_m2 numeric,
  price_per_m2 numeric,
  total_price numeric,
  status text default 'Nháp',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table profiles enable row level security;
alter table customers enable row level security;
alter table tiles enable row level security;
alter table projects enable row level security;
alter table quotations enable row level security;

drop policy if exists "profiles owner read" on profiles;
drop policy if exists "profiles owner insert" on profiles;
drop policy if exists "profiles owner update" on profiles;
drop policy if exists "customers owner all" on customers;
drop policy if exists "tiles owner all" on tiles;
drop policy if exists "projects owner all" on projects;
drop policy if exists "quotations owner all" on quotations;

create policy "profiles owner read" on profiles for select using (auth.uid() = id);
create policy "profiles owner insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles owner update" on profiles for update using (auth.uid() = id);

create policy "customers owner all" on customers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tiles owner all" on tiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects owner all" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quotations owner all" on quotations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
