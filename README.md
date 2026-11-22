# Pusthaya.lk — Next.js + Supabase starter

Official repository for pusthaya.lk. The customer website and role-protected admin dashboard use one Next.js application.

## Stack
Next.js 16, React 19, TypeScript, custom CSS and Supabase (Postgres, Auth, RLS). Hosting target: Cloudflare Workers.

## Setup
1. Install Node.js and run `npm install`.
2. Copy `.env.example` to `.env.local` and populate the Supabase project URL and publishable key.
3. Review and execute `supabase/schema.sql` in a **new** Supabase project's SQL Editor.
4. Run `npm run dev` and open http://localhost:3000.
5. Sign up through /sign-in, confirm email if enabled, find the new auth user UUID in the Supabase dashboard and execute the Owner bootstrap SQL described in the schema (replace the placeholder with the actual UUID).
6. Visit /admin to manage categories and menus.

## Security
Never commit service-role or secret keys. Newly registered users receive customer access. Owner assignment is deliberately manual until a server-verified staff invitation and role-assignment flow is implemented. Database policies, not client-side visibility, enforce permissions.

## Status and limitations
Early foundation, not production-ready. Implemented: homepage, browse published products, grade links, account sign-in/register, quotation creation, protected admin dashboard, basic category/menu creation and visibility controls, quotation inbox. Still required: product editor, order/cart/checkout, actual payments, customer account pages, file uploads, admin role invitation workflow, SMTP emails, rate limits, reliable session refresh, Cloudflare deployment adapter and production testing.

## Development
The `develop` branch contains implementation work; `main` remains the stable baseline.
