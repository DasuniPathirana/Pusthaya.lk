-- Pusthaya.lk initial database and row-level security setup.
-- Apply to a NEW Supabase project after reviewing permissions.
create extension if not exists pgcrypto;
create schema if not exists private;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 created_at timestamptz not null default now()
);
create table public.user_roles (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 role text not null default 'customer' check(role in ('owner','manager','editor','fulfilment','customer'))
);
create table public.categories (
 id uuid primary key default gen_random_uuid(),
 name text not null, slug text not null unique,
 description text, accent text not null default '#D8E3F2',
 sort_order integer not null default 0,
 is_visible boolean not null default true
);
create table public.navigation_items (
 id uuid primary key default gen_random_uuid(),
 label text not null, href text not null,
 location text not null default 'both' check(location in ('header','footer','both')),
 sort_order integer not null default 0,
 is_visible boolean not null default true,
 constraint safe_href check(href ~ '^/[a-zA-Z0-9/_?=&%-]*$')
);
create table public.products (
 id uuid primary key default gen_random_uuid(),
 title text not null, slug text not null unique,
 description text, category_id uuid references public.categories(id) on delete set null,
 price_lkr numeric(12,2) check(price_lkr>=0),
 stock_qty int not null default 0 check(stock_qty>=0),
 image_url text,
 status text not null default 'draft' check(status in ('draft','published')),
 created_at timestamptz not null default now()
);
create table public.quotations (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id) on delete cascade,
 category text not null,
 details text not null check(char_length(details) between 12 and 3000),
 quantity int not null default 1 check(quantity between 1 and 100000),
 status text not null default 'new' check(status in ('new','reviewing','quoted','declined')),
 created_at timestamptz not null default now()
);

create or replace function private.has_role(allowed text[]) returns boolean
language sql stable security definer set search_path='' as $$
 select exists (select 1 from public.user_roles where user_id=(select auth.uid()) and role=any(allowed));
$$;
revoke all on function private.has_role(text[]) from public;
grant usage on schema private to anon,authenticated;
grant execute on function private.has_role(text[]) to anon,authenticated;

create or replace function private.new_user() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id) values(new.id);
 insert into public.user_roles(user_id,role) values(new.id,'customer');
 return new;
end;
$$;
create trigger pusthaya_new_user after insert on auth.users for each row execute function private.new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.navigation_items enable row level security;
alter table public.products enable row level security;
alter table public.quotations enable row level security;

create policy "profile own read" on public.profiles for select to authenticated using (id=(select auth.uid()) or private.has_role(array['owner']));
create policy "profile own update" on public.profiles for update to authenticated using (id=(select auth.uid())) with check(id=(select auth.uid()));
create policy "role own read" on public.user_roles for select to authenticated using (user_id=(select auth.uid()) or private.has_role(array['owner']));
create policy "category public read" on public.categories for select to anon,authenticated using (is_visible or private.has_role(array['owner','manager','editor']));
create policy "category staff write" on public.categories for all to authenticated using(private.has_role(array['owner','manager','editor'])) with check(private.has_role(array['owner','manager','editor']));
create policy "nav public read" on public.navigation_items for select to anon,authenticated using(is_visible or private.has_role(array['owner','manager','editor']));
create policy "nav staff write" on public.navigation_items for all to authenticated using(private.has_role(array['owner','manager','editor'])) with check(private.has_role(array['owner','manager','editor']));
create policy "products public read" on public.products for select to anon,authenticated using(status='published' or private.has_role(array['owner','manager','editor']));
create policy "products staff write" on public.products for all to authenticated using(private.has_role(array['owner','manager','editor'])) with check(private.has_role(array['owner','manager','editor']));
create policy "quotations customer read" on public.quotations for select to authenticated using(customer_id=(select auth.uid()) or private.has_role(array['owner','manager','fulfilment']));
create policy "quotations customer create" on public.quotations for insert to authenticated with check(customer_id=(select auth.uid()) and status='new');
create policy "quotations staff update" on public.quotations for update to authenticated using(private.has_role(array['owner','manager','fulfilment'])) with check(private.has_role(array['owner','manager','fulfilment']));

-- FIRST OWNER BOOTSTRAP (run manually in SQL editor after signing up):
-- update public.user_roles set role='owner' where user_id = 'ACTUAL-OWNER-AUTH-UUID';
-- Never grant owner role based on an email supplied by the browser.

-- Only an existing Owner can change the role of another account.
-- Do not allow an Owner to demote their own session accidentally.
create policy "roles owner update staff" on public.user_roles
for update to authenticated
using (private.has_role(array['owner']) and user_id <> (select auth.uid()))
with check (private.has_role(array['owner']) and user_id <> (select auth.uid()));

-- Initial editable storefront navigation.
insert into public.navigation_items(label,href,location,sort_order) values
 ('Shop','/shop','header',10),
 ('School books','/books','header',20),
 ('Custom quotations','/quotes','both',30);
-- Initial categories, editable from Admin > Categories.
insert into public.categories(name,slug,description,accent,sort_order) values
 ('School books','school-books','Grades 1 to 13 and Cambridge','#DDE7F7',10),
 ('Stationery','stationery','For work and study','#F6E2C9',20),
 ('Gifts and packs','gifts','Personalised gifts and packs','#F3D9E5',30),
 ('Printing','printing','Printing and finishing services','#D8EBE7',40);
