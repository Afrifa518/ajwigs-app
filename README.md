# House of Ajwigs — Full E-commerce

> End-to-end e-commerce platform for **House of Ajwigs**, a Ghanaian wig and hair-products retailer. Shipped for a family-run business — public storefront, customer accounts, payments, and a full staff CMS — built and run solo.

**Status** — Was live and transacting in production. Currently paused while the business is on hold.

---

## What it does

A complete online store with everything needed to run a small retail business end-to-end, not just a product page.

### Customer side
- Browse the product catalogue with categories, images, and detail pages
- Add items to a cart that persists across sessions
- Sign up / log in as a returning customer
- Check out with real payment processing
- View order history and track order status

### Admin side (staff CMS)
- Add, edit, and retire products (images, pricing, variants, stock)
- Manage incoming orders — mark as paid, packed, shipped, delivered
- See customers, their order history, and contact details
- Basic sales visibility for the owner

### Platform
- Auth with session management
- Role checks so only staff can access admin routes
- Transactional payment flow with webhook handling so orders only mark paid after the provider confirms
- Media storage for product images

---

## Stack

| Layer | Tech |
|---|---|
| Framework | **Next.js** (App Router) |
| Language | **TypeScript** (with some JS) |
| Styling | **Tailwind CSS** |
| Backend / DB | **Supabase** (Postgres + Auth + Storage) |
| Auth middleware | `middleware.ts` — route-level session + role checks |
| Payments | Provider webhook-driven order settlement |
| Hosting | **Vercel** (primary) · Netlify config also present |

### Why this stack

- **Next.js App Router** kept the storefront fast (server components for catalogue pages, good SEO out of the box) while letting the admin area run as interactive client components.
- **Supabase** meant I could ship auth, Postgres, Row-Level Security policies, and storage without building or hosting a separate backend — a real advantage for a small-business budget.
- **TypeScript + Tailwind** made the admin CMS fast to iterate on while keeping the storefront polished.
- **Vercel** gave zero-config preview deployments for every branch — useful when the business owner wanted to preview changes before they went live.

---

## Repository layout

```
├── app/             # Next.js App Router — public storefront routes
├── admin/           # Admin CMS routes (staff-only, guarded by middleware)
├── frontend/        # Customer-facing UI components
├── backend/         # API routes / server actions / webhook handlers
├── lib/             # Shared utilities (supabase client, helpers, types)
├── supabase/        # Migrations / local Supabase config
├── assets/          # Static assets
├── middleware.ts    # Session + role enforcement at the edge
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## Running it locally

```bash
git clone https://github.com/Afrifa518/ajwigs-app.git
cd ajwigs-app

# Install
npm install

# Env
cp .env.example .env.local
# Fill in Supabase URL + anon/service keys and payment provider keys

# Dev server
npm run dev

# Production build
npm run build
npm run start
```

Supabase migrations live in `supabase/`. Point the CLI at your project and push them up before first run.

---

## What this project demonstrates

- **Full ownership of a real retail ecommerce** — product catalogue, cart, checkout, payments, fulfilment, admin CMS, customer accounts. Not a tutorial build.
- **Working with non-technical business owners** — the admin panel is deliberately simple so a non-engineer could actually use it to run the shop day to day.
- **Server-rendered + interactive in the same app** — using Next.js App Router to keep the storefront SEO-friendly while giving the admin area rich client-side behaviour.
- **Supabase in anger** — Postgres schema, Row-Level Security, auth flows, storage, webhooks — the full managed-backend toolkit in a production app.
- **Shipping for a family business** — different from enterprise work: tight budget, no design team, no ops team, you are the whole engineering organisation. Forces pragmatic tradeoffs.

---

## Related work

This is part of a broader body of production work I've shipped solo. The main one is **KPee**, a multi-tenant SaaS platform for agricultural cooperatives in Ghana:

- [kpee-platform-overview](https://github.com/Afrifa518/kpee-platform-overview) — architecture of the full platform (FastAPI backend + 10 frontends + marketplace + General Ledger)
- [kpee-ai-overview](https://github.com/Afrifa518/kpee-ai-overview) — architecture of the role-scoped AI agent system inside KPee
- [grace-life-mission](https://github.com/Afrifa518/grace-life-mission) — another live full-stack site + CMS (church platform)

---

## Contact

**Afrifa Yaw Ankamah** — CTO, Kibbutz Pishon Ltd
afrifabusiness518@gmail.com · +233 50 968 7490 · Accra, Ghana

Open to remote full-stack / backend engineering roles. [github.com/Afrifa518](https://github.com/Afrifa518)
