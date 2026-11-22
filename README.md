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

The user selected **DasuniPathirana's Org** (organization ID `axilwxaxxhqipxptegsk`) for a completely separate Pusthaya project in region `ap-south-1` (Mumbai). The quoted project cost was `$0/month` and the user approved it.

**Creation status (2026-11-22): blocked, not created.** Supabase rejected the attempt because the account is an Owner/Administrator of two active Free projects across organizations. This is an *account-wide* limit, despite the destination organization having an available local slot. No charge was made. **Do not create or link Pusthaya to the 9 Gens organization, and do not modify projects there.** Do not claim the application is deployed or live checkout works.

The next step requires the user to resolve the Free project limit through a change they approve (e.g. upgrading the separate Pusthaya organization to a paid plan, or managing other free-project ownership/availability). Never perform a paid-plan action without explicit consent.

Once a dedicated Pusthaya project exists:

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
