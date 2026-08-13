# Dadda's Confectionery

Next.js storefront + full bakery admin / commerce platform for [Dadda's Confectionery](https://daddasconfectionery.co.za/).

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, TanStack Query, Recharts
- **Data:** PostgreSQL + Prisma
- **Auth:** JWT admin sessions (roles), existing customer cookie sessions
- **Payments:** Yoco + EFT (banking details configurable in admin)
- **Email:** Nodemailer / SMTP (env-configured)

## Quick start

```bash
# 1. Start Postgres (host port 5434)
docker compose up -d postgres

# 2. Env
cp .env.example .env.local
# DATABASE_URL is already documented in .env.example

# 3. Migrate + seed
pnpm install
pnpm db:migrate
pnpm db:seed

# 4. Dev server (port 3000 may be taken — use 3001 if needed)
pnpm dev
# or: pnpm exec next dev -p 3001
```

### Admin login (seed)

- URL: `/admin/login`
- Email: `admin@daddasconfectionery.co.za`
- Password: `admin123!`

Change this password before production.

## What is live

| Area | Status |
|------|--------|
| Admin dashboard (real metrics) | ✅ |
| Orders CRUD + Kanban board + status audit | ✅ |
| Website checkout → persisted orders | ✅ |
| Customers / CRM | ✅ |
| Products + categories | ✅ |
| Payments + EFT verification + Yoco webhook ledger | ✅ |
| Quotes, invoices, custom cake requests | ✅ |
| Inventory + expenses/income | ✅ |
| CMS: hero, gallery, testimonials, FAQs | ✅ |
| Settings, users list, audit log | ✅ |
| Deliveries, promotions, enquiries, calendar | ✅ |
| Reports / analytics charts | ✅ |

Customer storefront (cakes, checkout, Yoco, delivery quotes) continues to work as before; orders now save to the database.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js development |
| `pnpm build` | Production build |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Demo bakery data |
| `pnpm db:studio` | Prisma Studio |
| `docker compose up -d postgres` | Local database |
| `docker compose --profile full up -d --build` | App + DB containers |

## Environment

See `.env.example` for `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, email, Yoco, storage, WhatsApp, and analytics placeholders.

Never commit real secrets.

## Production notes

- Run migrations on deploy: `prisma migrate deploy`
- Set strong `JWT_SECRET` / `SESSION_SECRET`
- Put Postgres behind private networking; expose HTTPS via reverse proxy
- Use `scripts/backup.sh` (or managed backups) for retention
- Admin is at `/admin` and is `noindex`

## Roadmap (next increments)

Newsletter send pipeline, WhatsApp Business API, image upload to S3-compatible storage, customer account portal polish, PWA push notifications, full automation job runner, and E2E test suite.
