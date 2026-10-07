# ForcePK — Deploy Playbook

One command ships the current repo state to the live site at **https://forcepk.com**.

```bash
FORCEPK_SSH_KEY=~/.ssh/shadilife_deploy bash deploy/deploy.sh
```

That packs the source, uploads it (never touching the server's secrets), installs deps,
runs `prisma generate`, builds, restarts the PM2 process, and health-checks the site.

## Optional flags

```bash
# apply new DB migrations during deploy
FORCEPK_SSH_KEY=~/.ssh/shadilife_deploy RUN_MIGRATIONS=1 bash deploy/deploy.sh

# (re)seed demo data — only adds rows where tables are empty
FORCEPK_SSH_KEY=~/.ssh/shadilife_deploy RUN_SEED=1 bash deploy/deploy.sh
```

## Production topology

| Thing            | Value                                            |
|------------------|--------------------------------------------------|
| Host             | `root@187.127.74.184` (Ubuntu, Node 22, PM2)     |
| SSH deploy key   | `~/.ssh/shadilife_deploy`                        |
| App directory    | `/var/www/forcepk`                               |
| PM2 process      | `forcepk-frontend` (`npm start`)                 |
| App port         | `127.0.0.1:3005`                                 |
| Reverse proxy    | nginx → see `deploy/nginx-forcepk.conf`          |
| TLS              | Let's Encrypt / certbot (`forcepk.com`, `www`)   |
| Database         | local PostgreSQL `forcepk` on `localhost:5432`   |
| Domain           | https://forcepk.com                              |

The server keeps its own `/var/www/forcepk/.env` (chmod 600). The deploy script
**excludes every `.env*`**, so server secrets are never overwritten by a deploy.

> This VPS also hosts other apps (ghrfix, shadilife, bwmc-hms, ai-command-center).
> The deploy only touches `/var/www/forcepk` + the `forcepk-frontend` PM2 process —
> nothing else is affected.

## Running this from a Claude cloud session

A cloud sandbox has the repo but **not** your SSH key or server `.env`. To let it deploy,
hand over the two things only you can provide (nothing secret is committed to the repo):

1. **SSH deploy key** — paste your private key into the cloud session at
   `~/.ssh/shadilife_deploy`, then:
   ```bash
   chmod 600 ~/.ssh/shadilife_deploy
   ```
   That alone is enough to deploy — the server already has its own `.env`.

2. **Env values** *(only if the cloud session also RUNS the app locally)* — print your
   local file and paste it into the cloud session's secret manager. Keys and where each
   value comes from are documented in `.env.production.example`:
   ```bash
   cat .env        # your local copy — do NOT commit this
   ```

Then from the repo root in the cloud session:

```bash
FORCEPK_SSH_KEY=~/.ssh/shadilife_deploy bash deploy/deploy.sh
```

## Manual deploy (no script)

```bash
tar czf - --exclude=node_modules --exclude=.next --exclude=.git \
  --exclude='.env*' --exclude=.pgdata app components lib prisma public scripts \
  auth.ts auth.config.ts middleware.ts next.config.mjs package*.json \
  postcss.config.mjs tailwind.config.ts tsconfig.json \
  | ssh -i ~/.ssh/shadilife_deploy root@187.127.74.184 "tar xzf - -C /var/www/forcepk"

ssh -i ~/.ssh/shadilife_deploy root@187.127.74.184 \
  "cd /var/www/forcepk && npm install && npx prisma generate && npm run build && pm2 restart forcepk-frontend"
```

## Demo accounts (seeded)

Password for all: `Password123`

| Email                      | Role        |
|----------------------------|-------------|
| `owner@forcepk.com`        | Super Admin |
| `employer@abctrading.sa`   | Employer    |
| `partner@abcrecruit.pk`    | OEP Partner |
| `candidate@forcepk.com`    | Candidate   |

> Before real launch: change `owner@forcepk.com`'s password and remove the demo-account
> panel on the login page.
