-- Pusthaya.lk customer cart. Apply AFTER supabase/schema.sql in the new project.
-- Authenticated carts are persisted in Postgres. Guest carts are browser-local until sign-in.
create table public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index cart_items_product_id_idx on public.cart_items (product_id);
alter table public.cart_items enable row level security;

grant select, insert, update, delete on public.cart_items to authenticated;

create policy "cart_items_select_own"
on public.cart_items for select to authenticated
using (user_id = (select auth.uid()));

create policy "cart_items_insert_own_available_products"
on public.cart_items for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.products p
    where p.id = cart_items.product_id
      and p.status = 'published'
      and p.price_lkr is not null
      and p.stock_qty >= cart_items.quantity
  )
);

create policy "cart_items_update_own_available_products"
on public.cart_items for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.products p
    where p.id = cart_items.product_id
      and p.status = 'published'
      and p.price_lkr is not null
      and p.stock_qty >= cart_items.quantity
  )
);

create policy "cart_items_delete_own"
on public.cart_items for delete to authenticated
using (user_id = (select auth.uid()));

-- Cart amounts are estimates resolved from current product prices.
-- Future checkout MUST re-read prices and reserve stock in a trusted transaction;
-- never trust the browser's subtotal or stock availability.
