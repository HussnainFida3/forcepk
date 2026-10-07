# ForcePK — project guide for Claude

B2B global manpower/workforce recruitment platform (forcepk.com). Connects employers,
OEP/recruitment partners, and candidates, with a super-admin command center.

## Stack
- **Next.js 14.2** (App Router) · TypeScript · Tailwind CSS · React 18
- **Prisma 6 + PostgreSQL** — schema in `prisma/schema.prisma`, demo data in `prisma/seed.ts`
- **Auth.js v5** (next-auth beta) — `auth.ts` (Node: credentials + Google) + `auth.config.ts` (edge/middleware); JWT sessions; 11-role RBAC in `lib/rbac.ts`
- Server Actions in `lib/mutations.ts`; data access in `lib/queries.ts`
- External integrations are env-gated stubs in `lib/integrations/` (AI, email, SMS/WhatsApp, Stripe, Zoom, DocuSign) — they activate only when the matching env var is set.

## Layout
- `app/(site)/` — public marketing site (home, jobs, employers, partners, about, legal)
- `app/admin/` — super-admin command center · `app/employer/` · `app/partner/` · `app/candidate/` — portals
- `components/` — shared UI (`components/ui/charts.tsx` are dependency-free SVG charts)
- `lib/images.ts` — central verified image set (Unsplash + randomuser portraits)

## Local dev
```bash
npm install
npx prisma generate
# needs a Postgres DATABASE_URL in .env (see .env.production.example for all keys).
# For a throwaway DB, the repo includes embedded-postgres; otherwise point at any Postgres.
npx prisma migrate deploy   # or: npx prisma db push
npx prisma db seed          # demo data (120 companies, 500+ candidates, etc.)
npm run dev
```
Secrets live in `.env` (gitignored). `.env.production.example` lists every key and where
its value comes from.

## Deploy to the live site
See **`deploy/README.md`**. One command from the repo root:
```bash
FORCEPK_SSH_KEY=~/.ssh/shadilife_deploy bash deploy/deploy.sh
```
- Uploads source (excludes all `.env*` — server secrets are preserved), installs, builds,
  restarts PM2 `forcepk-frontend`, and health-checks https://forcepk.com.
- Add `RUN_MIGRATIONS=1` to apply DB migrations, `RUN_SEED=1` to seed demo data.
- Host `root@187.127.74.184`, app dir `/var/www/forcepk`, port `3005` behind nginx.
- **A cloud session needs the SSH key placed at `~/.ssh/shadilife_deploy` (chmod 600) to deploy** — it is NOT in the repo.

## Conventions
- Match surrounding style; portal pages are server components with `export const dynamic = "force-dynamic"` where they read live data.
- Don't commit `.env` or any real secret. Don't disturb other apps on the VPS
  (ghrfix, shadilife, bwmc-hms, ai-command-center).
