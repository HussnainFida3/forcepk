# ForcePK — Recruitment Ecosystem (forcepk.com)

B2B manpower recruitment platform connecting **Saudi employers → ForcePK → OEP partners → Pakistani candidates**.
Built with **Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · Auth.js v5**.

## What's built
- **Public site** — `/`, `/jobs`, `/employers`, `/partners`, `/about`, `/login`
- **Four portals** (role-gated): `/admin` (Super Admin Command Center), `/employer`, `/partner`, `/candidate`
- **Auth + RBAC** — credentials login, JWT sessions, 11 roles, middleware route-guarding, role-based redirect
- **Database schema** — full ecosystem data model (companies, OEPs, candidates, requirements, applications, documents, interviews, commissions, invoices, notifications, audit logs)

## Getting started

### 1. Install
```bash
npm install
```

### 2. Database (PostgreSQL)
Copy env (defaults already point at the embedded DB on port 5433):
```bash
cp .env.example .env   # .env is already set for local dev
```

**Easiest — embedded Postgres (no Docker, no install):** this repo bundles a real
PostgreSQL 18 that runs locally. Start it in its own terminal and leave it running:
```bash
npm run db:start        # serves Postgres on 127.0.0.1:5433, DB "forcepk"
```

Or use your own Postgres / Docker and point `DATABASE_URL` at it:
```bash
docker run --name forcepk-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=forcepk -p 5432:5432 -d postgres:16
```

### 3. Migrate + seed
```bash
npm run db:migrate      # create tables
npm run db:seed         # demo accounts + sample data
```

### 4. Run
```bash
npm run dev             # http://localhost:3000
```

## Demo accounts (password: `Password123`)
| Email | Role | Lands on |
|-------|------|----------|
| owner@forcepk.com | Super Admin | /admin |
| employer@abctrading.sa | Saudi Employer | /employer |
| partner@abcrecruit.pk | OEP Partner | /partner |
| candidate@forcepk.com | Candidate | /candidate |

## Auth & RBAC
- `auth.config.ts` — edge-safe config (middleware): session strategy + `authorized` guard.
- `auth.ts` — Node runtime: Credentials provider (bcrypt + Prisma lookup).
- `middleware.ts` — guards `/admin`, `/employer`, `/partner`, `/candidate`.
- `lib/rbac.ts` — role→area mapping, `canAccess()`, `homeForRole()`.
- Wrong-area access redirects users to their own portal home.

## Key scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run db:migrate` | Prisma migrate (dev) |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio (DB GUI) |
| `npm run db:push` | Push schema without migration |

## External integrations
Every integration is **optional** and off by default — the platform runs fully with zero keys (safe stubs). Add a key to `.env` and restart; the feature activates instantly. Live status at **`/admin/integrations`**.

| Integration | Env vars | Powers |
|-------------|----------|--------|
| Email (Resend) | `RESEND_API_KEY`, `EMAIL_FROM` | Email notifications |
| WhatsApp (Meta) | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | WhatsApp notifications |
| SMS (Twilio) | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | SMS notifications |
| AI (Anthropic) | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | CV parsing, matching, admin AI assistant |
| Storage (S3) | `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Document storage (else local disk) |
| Payments (Stripe) | `STRIPE_SECRET_KEY` | Invoice checkout |
| Video (Zoom) | `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` | Interview meeting links |
| E-signature (DocuSign) | `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_ACCOUNT_ID` | Contract signing |
| Gov (Qiwa/Musaned) | `QIWA_API_KEY` | Integration-ready (needs official authorization) |

Code lives in `lib/integrations/`. `notifyUser()` fans out to in-app + email + WhatsApp + SMS; AI scoring is in `lib/integrations/ai.ts`.
