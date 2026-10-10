# ForcePK — Pre-Deployment Checklist (for Hussnain)

This file tracks everything **you** need to provide or decide before go-live, plus
the work still remaining. Items are grouped by whether they need *your* input
(keys/credentials/decisions) or are *engineering tasks* we can finish.

Last updated by the build session. Tick items as you complete them.

---

## 1. Credentials & keys you said you'll add

Every integration is **env-gated** and degrades to a safe stub, so the site runs
fine with none of these — they just "light up" features when added. Put real
values in the server's `.env` (never commit them; the repo is public).

- [ ] **Cloudinary** (media/image/logo uploads) — you said you'll give credentials
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - Integration is already wired (`lib/integrations/media.ts`). Falls back to
    local `/public/uploads` until keys are set.
- [ ] **Resend** (email verification + transactional email) — token at the end
  - `RESEND_API_KEY`, `EMAIL_FROM` (e.g. `ForcePK <noreply@forcepk.com>`)
  - Email sending is wired (`lib/integrations/channels.ts`). **Email-verification
    flow still needs to be built on top of it** (see §3).
- [ ] **Anthropic (Claude) AI** — API key for AI features
  - `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL`
  - Candidate matching, CV parsing and the admin AI assistant already call the
    model when the key is present (`lib/integrations/ai.ts`).
- [ ] **Database** — production Postgres connection
  - `DATABASE_URL`
- [ ] **Auth** — `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (generate a strong secret)
- [ ] *(optional)* Google sign-in: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] *(optional)* Payments: `STRIPE_SECRET_KEY`
- [ ] *(optional)* WhatsApp: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`
- [ ] *(optional)* SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`
- [ ] *(optional)* Zoom interviews / DocuSign e-sign — see `.env.example`

> The full key list with placeholders is in **`.env.example`**. The admin
> **Integrations** page shows which are connected live.

---

## 2. Decisions we need from you

- [ ] **Home page redesign direction.** You said you dislike the current look.
  The font is Inter (a clean, standard typeface) wired correctly — the issue is
  the *design/layout*, which is subjective. **Please send 2–3 reference sites
  whose look you like** (hero, spacing, colour, typography) so the redesign hits
  your taste instead of guessing. Without references we risk rebuilding something
  you also dislike.
- [ ] **Brand logo.** Confirm `public/logo.png` is the final logo (now used in the
  public header *and* all four portal sidebars). Send a higher-res / SVG version
  if you have one.
- [ ] **Change the demo admin password** from the shared seed password before the
  live site is exposed (`owner@forcepk.com`). Tell us if you want this rotated.
- [ ] **Company/partner deletion policy.** Admin delete now cascades (removes a
  company's requirements, applications, invoices, replacements). Confirm you want
  a hard delete, or prefer a soft "archive" instead.

---

## 3. Engineering work still to do (we can finish these)

### Done ✅
- Responsive **stat/graph cards** rebuilt on **Recharts** across admin + reports.
- **Sidebar** cleaned (all 4 portals): real logo, correct active highlight,
  scroll, distinct icons, no footer overlap.
- **Footer**: US office address, phone, "Made by Canfida" → canfida.com.
- **Command Center "Urgent Actions"** 100% real-time from the database.
- **Full admin CRUD** (View / Edit / Delete / status) for:
  - **Companies** — detail/edit, verify/suspend/reject/reactivate/set-pending, delete.
  - **Partners (OEPs)** — detail/edit, license + tier + rating, status, delete.
  - **Requirements** — detail/edit all fields, status/priority, applicants, delete.
  - **Candidates** — admin edit page + delete (list has View/Edit/Delete).
  - **CRM leads** — detail/edit, stage, notes, delete.
  - **Finance** — invoices pay/mark-paid/void/delete.
- **Email verification flow** — token model, verify link on signup, `/verify`
  page, resend button (activates with RESEND_API_KEY).
- **AI** fully wired (activates with ANTHROPIC_API_KEY): match scoring on every
  submit/apply, CV parse, JD generator, interview-question generator, admin
  assistant — all with heuristic fallbacks.
- **Cloudinary** media upload end-to-end: company logo upload on employer
  profile via `uploadMedia()` (Cloudinary when keyed, local disk otherwise).
- **Home page** redesigned (cleaner modern SaaS hero). *Send reference sites if
  you want a specific look — see §2.*
- Admin data tables scroll instead of clipping on mobile.
- **Full production build passes.**

### ⚠️ Server step required before these work live
- [ ] Run **`npx prisma migrate deploy`** (or `prisma db push`) on the server. Recent schema additions needing it: OEP countries + agreement fields, Company agreement fields, Requirement expiryDate + optional company/oep (OEP-posted requirements), and a new MEDICAL stage. Plus:
  email verification adds a `User.emailVerified` column and an
  `EmailVerificationToken` table.

### Remaining — nice-to-haves (optional, not blocking)
- [ ] Documents: bulk verify/reject, request re-upload.
- [ ] Replacements: richer case workflow screens.
- [ ] Portal depth: candidate doc uploads via Cloudinary, partner submission UI,
  employer CV download.
- [ ] Optionally block unverified logins (currently verification is non-blocking
  so you're never locked out).
- [ ] KPI trend deltas: a few are placeholders (no history table). Add a daily
  metrics snapshot/cron to make them fully real — say the word.
- [ ] Accessibility + per-page SEO metadata pass.

---

## 4. Notes
- The site is **more complete than ~20%** — most pages are real, backed by Prisma
  queries. The main gaps are CRUD *depth*, the integrations above, and home-page
  styling.
- Nothing here blocks a deploy; these are enhancements and config. Add the keys in
  §1 and the matching features activate automatically.
