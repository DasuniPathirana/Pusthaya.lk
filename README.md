# Pusthaya.lk

A creative-commerce website for books, stationery, school supplies, personalised gifts, printing and custom quotations.

## Stack

- Next.js 16.4.6, React 19.3.1, TypeScript
- Supabase PostgreSQL, Auth and Row Level Security
- Planned low-cost hosting: Cloudflare Workers
- One application for public storefront and role-based admin

## Implemented on `develop`

- Responsive light professional homepage
- Database-driven main navigation and homepage category sections
- Published product listing and category filtering
- Sign-up and sign-in using Supabase Auth
- Role-protected admin for products, categories, menus, quotations and Owner-only role changes
- Product creation, editing, publishing and removal
- Customer quotation submission for any type of product or service
- **Shopping bag with add, update quantity and remove**
- **Guest bag persisted in browser localStorage**
- **Signed-in bag persisted in Supabase `cart_items` with ownership RLS**
- Guest bag merged into signed-in bag after authentication
- Out-of-stock and quote-only products are not addable
- Cart total displayed as an estimate, not a final charge
- CI workflow to typecheck/build on pushes (a passing run has not been verified)

## Important: Live Supabase project is NOT connected yet

The connected Supabase organisation has two active Free projects for other applications. To avoid touching existing apps or starting an unapproved bill, a dedicated Pusthaya project has **not** been created. Do not claim this code is deployed or a real checkout is available.

When a dedicated Pusthaya project is approved:

1. Create the Supabase project and confirm it is `ACTIVE_HEALTHY`.
2. Review `supabase/schema.sql` and apply it using the SQL editor or the Supabase database migration workflow.
3. Review `supabase/cart.sql` and apply it after the main schema.
4. Copy `.env.example` to `.env.local` and provide the project URL and **publishable** key.
5. Install dependencies with `npm install`, commit `package-lock.json`, run `npm run typecheck` and `npm run build`.
6. Sign up the first real Owner and verify the user's email if required.
7. Bootstrap the first Owner **manually** using the actual Auth UUID:
   `update public.user_roles set role='owner' where user_id='ACTUAL_AUTH_USER_UUID';`
8. Test roles and cart RLS with separate customer accounts. Visit `/admin/users` to assign staff.
9. Test cart add, quantity change, remove, logout, sign-in, merging and simultaneous accounts.

## How the cart works

- **Guest:** Cart items are saved locally on the current device, so they do not follow the customer across devices until sign-in.
- **Signed-in:** Cart items are stored in `public.cart_items`, keyed by `(user_id,product_id)`; RLS restricts access to the signed-in account.
- **Merge:** Signing in attempts to merge guest items into the account cart after rechecking product availability, price and stock; it clears local data only after successful writes.
- **Prices:** The UI shows an estimate based on current catalogue prices for signed-in users. Checkout must calculate authoritative totals in a trusted backend transaction and enforce stock availability.
- **Product availability:** Quote-only items, draft items and items without stock cannot be added from the shop.
- **Status:** No payment gateway, checkout processing, inventory reservation or real order placement yet.

## Remaining production requirements

- A dedicated Supabase project and actual migration/security policy testing
- Secure product-image upload, storage policies and asset optimisation
- Complete checkout and atomic stock reservation
- Payment gateway callbacks with signature verification
- Customer order history, delivery charges and fulfilment
- Upload attachments, quote replies and notifications
- Rate limiting and anti-spam
- Verified CI build, reproducible package lockfile and browser tests
- Cloudflare Workers preview and production deployment

All new work is on `develop`. `main` is the stable placeholder and must not be used for orders or payments yet.
