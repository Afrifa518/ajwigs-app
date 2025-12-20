create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price_pence integer not null check (price_pence >= 0),
  category text not null,
  subcategory text not null,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  image_urls text[] not null default '{}',
  bestseller boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists products_read_all on public.products;
create policy products_read_all
on public.products
for select
using (true);

drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert
on public.products
for insert
with check (public.is_admin());

drop policy if exists products_admin_update on public.products;
create policy products_admin_update
on public.products
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete
on public.products
for delete
using (public.is_admin());

create table if not exists public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  color text not null,
  size text not null,
  quantity integer not null check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id, color, size)
);

alter table public.cart_items enable row level security;

drop policy if exists cart_items_select_own on public.cart_items;
create policy cart_items_select_own
on public.cart_items
for select
using (auth.uid() = user_id);

drop policy if exists cart_items_insert_own on public.cart_items;
create policy cart_items_insert_own
on public.cart_items
for insert
with check (auth.uid() = user_id);

drop policy if exists cart_items_update_own on public.cart_items;
create policy cart_items_update_own
on public.cart_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists cart_items_delete_own on public.cart_items;
create policy cart_items_delete_own
on public.cart_items
for delete
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row
execute function public.set_updated_at();

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'Order Placed',
      'Packing',
      'Out for delivery',
      'Delivered',
      'Cancelled'
    );
  end if;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_pence integer not null check (amount_pence >= 0),
  currency text not null default 'GBP',
  status public.order_status not null default 'Order Placed',
  payment_method text not null,
  payment boolean not null default false,
  stripe_session_id text,
  address jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists orders_select_own_or_admin on public.orders;
create policy orders_select_own_or_admin
on public.orders
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own
on public.orders
for insert
with check (auth.uid() = user_id);

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin
on public.orders
for update
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  name text not null,
  price_pence integer not null check (price_pence >= 0),
  quantity integer not null check (quantity > 0),
  color text,
  size text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

drop policy if exists order_items_select_via_order on public.order_items;
create policy order_items_select_via_order
on public.order_items
for select
using (
  exists(
    select 1
    from public.orders o
    where o.id = order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists order_items_insert_own on public.order_items;
create policy order_items_insert_own
on public.order_items
for insert
with check (
  exists(
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists order_items_update_admin on public.order_items;
create policy order_items_update_admin
on public.order_items
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists order_items_delete_admin on public.order_items;
create policy order_items_delete_admin
on public.order_items
for delete
using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists storage_product_images_read on storage.objects;
create policy storage_product_images_read
on storage.objects
for select
using (bucket_id = 'product-images');

drop policy if exists storage_product_images_insert_admin on storage.objects;
create policy storage_product_images_insert_admin
on storage.objects
for insert
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists storage_product_images_update_admin on storage.objects;
create policy storage_product_images_update_admin
on storage.objects
for update
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists storage_product_images_delete_admin on storage.objects;
create policy storage_product_images_delete_admin
on storage.objects
for delete
using (bucket_id = 'product-images' and public.is_admin());
