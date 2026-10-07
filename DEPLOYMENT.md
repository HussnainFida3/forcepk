# ForcePK — VPS Deployment (safe, non-disruptive)

This deploys ForcePK **alongside** your existing sites (ghrfix, bashir-welfare, AI agents) **without touching them**. It runs in its own Docker containers on an isolated network, binds only to `127.0.0.1:3005`, uses its own Postgres (not exposed), and adds **one new** nginx server block. Nothing else on the host is modified.

## 0. What you need
- A VPS with SSH access (Ubuntu/Debian assumed).
- Docker + Docker Compose plugin installed (`docker --version`, `docker compose version`). If missing: `curl -fsSL https://get.docker.com | sh`.
- nginx already installed (you have it for the other sites).
- DNS: an **A record** for `forcepk.com` (and `www`) pointing to the VPS IP.

## 1. Pre-flight — confirm no conflicts (does not change anything)
```bash
# Is port 3005 free? (ForcePK uses it on localhost only)
sudo ss -ltnp | grep 3005 || echo "3005 is free"
# Your other containers/sites keep running — we never stop them.
docker ps
ls /etc/nginx/sites-enabled/
```
If `3005` is taken, change both the compose `ports:` mapping and the nginx `proxy_pass` port to a free one.

## 2. Get the code onto the VPS
```bash
sudo mkdir -p /opt/forcepk && sudo chown $USER /opt/forcepk
# Option A: git clone <your-repo> /opt/forcepk
# Option B: copy this project folder to /opt/forcepk (rsync/scp)
cd /opt/forcepk
```

## 3. Configure environment
```bash
cp .env.production.example .env
nano .env    # set POSTGRES_PASSWORD, AUTH_SECRET (openssl rand -base64 32),
             # NEXTAUTH_URL=https://forcepk.com, ADMIN_EMAIL/ADMIN_PASSWORD,
             # NEXT_PUBLIC_WHATSAPP_NUMBER, and any integration keys you have.
```

## 4. Build & start (isolated stack)
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps        # app + db healthy
docker compose -f docker-compose.prod.yml logs -f app  # watch startup + migrations
```
Migrations run automatically on container start (`prisma migrate deploy`).

## 5. Create the Super Admin (once, no demo data)
```bash
docker compose -f docker-compose.prod.yml exec app sh -lc \
  'ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" node_modules/.bin/tsx scripts/bootstrap-admin.ts'
```
(Or set ADMIN_* in `.env` — they are passed through. Production does **not** load the demo seed.)

## 6. Verify the app locally on the VPS (before DNS/nginx)
```bash
curl -s http://127.0.0.1:3005/api/health    # {"status":"ok","db":"up"}
```

## 7. Add the nginx site (new block only)
```bash
sudo cp deploy/nginx-forcepk.conf /etc/nginx/sites-available/forcepk.conf
sudo ln -s /etc/nginx/sites-available/forcepk.conf /etc/nginx/sites-enabled/forcepk.conf
sudo nginx -t          # MUST pass — this validates ALL sites; if it fails, fix before reload
sudo systemctl reload nginx   # reload (not restart) — zero downtime for other sites
```

## 8. HTTPS (edits only ForcePK's block)
```bash
sudo certbot --nginx -d forcepk.com -d www.forcepk.com
```

## 9. Done — verify
- https://forcepk.com loads, `/api/health` is ok.
- Sign in with the admin you created. Other sites unaffected (`docker ps`, open them).

## Updates later (safe)
```bash
cd /opt/forcepk && git pull   # or re-copy
docker compose -f docker-compose.prod.yml up -d --build
```
Migrations apply automatically. Data persists in the `forcepk_pgdata` and `forcepk_storage` volumes.

## Backups
```bash
# Database
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U forcepk forcepk > forcepk_$(date +%F).sql
# Uploaded documents live in the forcepk_storage volume.
docker run --rm -v forcepk_forcepk_storage:/data -v $PWD:/backup alpine \
  tar czf /backup/forcepk_storage_$(date +%F).tgz -C /data .
```

## Rollback / stop (never affects other sites)
```bash
docker compose -f docker-compose.prod.yml down          # stop ForcePK only
sudo rm /etc/nginx/sites-enabled/forcepk.conf && sudo nginx -t && sudo systemctl reload nginx
```

## Why this can't disturb your other projects
- **Separate containers + network** (`forcepk_net`) — no shared processes.
- **Own Postgres** in a container, **not published** to the host — can't collide with other DBs.
- App bound to **127.0.0.1:3005 only** — no public port, no clash.
- **One new** nginx file; `nginx -t` is run before any reload; we `reload`, never `restart`.
- Persistent **named volumes** — upgrades/redeploys keep data.
