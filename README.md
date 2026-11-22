# Pusthaya.lk

A creative-commerce website for Sri Lankan books, stationery, school supplies, personalised gifts, printing and universal quotations.

## Architecture

- **Next.js 16 + React + TypeScript**, one app for the storefront and admin
- **Supabase PostgreSQL + Auth + Row Level Security**
- Planned hosting: **Cloudflare Workers** after the Next.js compatibility build is validated
- Light editorial design with richer orange, pink, blue and navy accents

## Implemented on the develop branch

- Responsive customer homepage, shop and school-grade links
- Database-driven navigation menus and homepage categories
- Category-filtered product listings
- Email/password account creation and sign-in
- Supabase cookie-based session refresh
- Admin routes protected by server-side user-role checks
- Owner-only staff role assignment screen, enforced by PostgreSQL RLS
- Admin category and menu addition/visibility
- Admin product create/edit/publish/delete
- Universal quotation submission and staff quotation inbox
- Database schema and initial menu/category seed data

## Local setup

1. Install Node.js, clone this repository, and check out `develop`.
2. Run `npm install` and commit the resulting lockfile.
3. Create a NEW Supabase project for Pusthaya.lk; do not reuse another application's database.
4. Review `supabase/schema.sql` and execute it once in the new project's SQL editor.
5. Copy `.env.example` to `.env.local` and supply the project's Supabase URL and **publishable** key.
6. Run `npm run dev`, then visit `http://localhost:3000`.
7. Sign up an Owner account, verify the email, and get that user's UUID from Supabase Authentication.
8. Bootstrap the first Owner **manually in the Supabase SQL editor**:
   `update public.user_roles set role='owner' where user_id='REPLACE_WITH_AUTH_USER_UUID';`
9. Sign back in and visit `/admin/users` to assign other users' roles.

Never expose a Supabase secret/service-role key in client-side code. Never paste credentials into a GitHub issue or commit them.

## Roles
- Owner: all administrative data and user-role assignments
- Manager: categories, menus, products, quotations
- Editor: categories, menus and products
- Fulfilment: quotations
- Customer: own quotation submissions

Role decisions are enforced in SQL, not just by hiding UI links.

## Still to build before launch

Cart, order processing, checkout, verified payment callbacks, inventory reservations, product image uploads, complete gift builder, persistent quote replies, customer order history, email deliverability, rate limiting, automated tests, a reproducible lockfile, and Cloudflare production deployment. The first code commit has **not yet passed an npm build**. Live business operations must not use this starter until deployment and security testing are complete.

The `main` branch remains the initial stable placeholder. Active implementation is on `develop`.
