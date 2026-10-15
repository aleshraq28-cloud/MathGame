# Deploying Math Treasure Hunt to Render (Docker)

This guide prepares the **Grade 3 Mathematics** game for Render’s **Docker web service** (including the free tier).  
**Deployment is not complete until you create the Render service, attach MySQL, set secrets, and verify the live URL.**

---

## 1. What this project uses

| Area | Value |
|------|--------|
| PHP | **8.3** (`composer.json`: `^8.3`; lockfile uses Laravel framework **v13.36**) |
| Laravel | **13.x** |
| Frontend | **Inertia.js 3** + **React 19** + **TypeScript** |
| Build tooling | **Vite 8** via `vite-plus` (`npm run build` → `vp build`) |
| Fonts | Bunny fonts downloaded at build time (need network during image build) |
| Wayfinder | `@laravel/vite-plugin-wayfinder` runs `php artisan` during `npm run build` |
| Database | **MySQL** (`DB_CONNECTION=mysql`) — also used for **sessions**, **cache**, and **queue** |
| Required PHP extensions | `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl`, `gd`, `zip`, `intl`, `pcntl`, `opcache` |

The Docker image runs **nginx** (document root = `public/`) + **php-fpm**, listening on Render’s **`PORT`** (default **10000**) on **0.0.0.0**.

---

## 2. Important: MySQL is not automatic on Render

Render’s free web service **does not include MySQL**.

This game **cannot** save student names or progress without a reachable MySQL database, because:

- Student accounts and stage progress live in MySQL tables
- `SESSION_DRIVER=database` stores login sessions in MySQL
- `CACHE_STORE=database` uses MySQL

### Options (choose one before go-live)

1. **External MySQL** (recommended to stay on MySQL)  
   Examples: Railway MySQL, Aiven, PlanetScale (or other MySQL-compatible hosts), a VPS with MySQL, your school’s MySQL server.  
   Create an empty database, then set `DB_*` on the Render web service.

2. **Render Postgres**  
   Available as a Render datastore, but this app is written and tested for **MySQL**. Switching would require code/config/test changes — **not done in this prep**.

3. **Do not use SQLite on Render free tier for production**  
   The free web service filesystem is **ephemeral**. A SQLite file inside the container is lost on restart/redeploy, so student progress would disappear. This setup intentionally targets MySQL.

Until MySQL is configured and migrations have run, the container may refuse to start (entrypoint waits for the DB) or the game will not persist data.

---

## 3. Generate `APP_KEY` locally (do this on your PC)

Never commit `.env`. Generate a key on your machine and paste it into Render as a secret:

```bash
php artisan key:generate --show
```

Copy the full value (starts with `base64:…`) into Render → Environment → `APP_KEY`.

If you do not have PHP locally:

```bash
docker run --rm -v "%cd%":/app -w /app composer:2 php artisan key:generate --show
```

(Only works after `composer install` has produced `vendor/`.)

---

## 4. Required Render environment variables

Set these on the **Web Service** (Environment tab). Mark secrets as secret where available.

### Application

| Variable | Example / notes |
|----------|------------------|
| `APP_NAME` | `Math Treasure Hunt` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | Output of `php artisan key:generate --show` (**secret**) |
| `APP_URL` | `https://YOUR-SERVICE.onrender.com` (update after first deploy) |
| `APP_LOCALE` | `ar` |
| `LOG_CHANNEL` | `stderr` |
| `LOG_LEVEL` | `info` or `error` |

### Database (MySQL — required)

| Variable | Notes |
|----------|--------|
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | Host from your MySQL provider |
| `DB_PORT` | Usually `3306` |
| `DB_DATABASE` | Database name |
| `DB_USERNAME` | User |
| `DB_PASSWORD` | Password (**secret**) |

Some providers give a single URL instead:

| Variable | Notes |
|----------|--------|
| `DB_URL` | `mysql://USER:PASSWORD@HOST:3306/DATABASE` (**secret**) |

If you set `DB_URL`, you can omit the individual `DB_*` fields (Laravel reads `DB_URL`).

### Sessions / cache / queue (match local production intent)

| Variable | Value |
|----------|--------|
| `SESSION_DRIVER` | `database` |
| `SESSION_LIFETIME` | `43200` (optional; long classroom sessions) |
| `SESSION_SECURE_COOKIE` | `true` |
| `CACHE_STORE` | `database` |
| `QUEUE_CONNECTION` | `database` (or `sync` if you prefer no queue worker) |

### Teacher login

| Variable | Notes |
|----------|--------|
| `TEACHER_NAME` | e.g. `سالمة` |
| `TEACHER_ACCESS_CODE` | **Change from the default** before public use (**secret**) |

### Docker entrypoint helpers

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | Set by Render | nginx listens on this port |
| `RUN_MIGRATIONS` | `true` | Runs `php artisan migrate --force` on boot (**additive only**, never `migrate:fresh`) |
| `RUN_CONTENT_SEED` | `false` | Set to `true` **once** to load stages/questions via `GameContentSeeder`, then set back to `false` |

---

## 5. Create the Render web service (manual steps)

1. Push this repository to GitHub (already: `MathGame`).
2. In [Render](https://render.com): **New** → **Web Service**.
3. Connect the GitHub repo.
4. Settings:
   - **Language / Runtime**: **Docker**
   - **Dockerfile path**: `./Dockerfile`
   - **Docker context**: `.` (repo root)
   - **Instance**: Free (or paid if you need no spin-down)
5. Add all environment variables from section 4 (**MySQL must be ready first**).
6. Deploy.
7. After the first successful deploy, set `APP_URL` to the real `https://….onrender.com` URL and redeploy (or restart).
8. Seed game content **once**:
   - Either set `RUN_CONTENT_SEED=true`, restart once, then set it back to `false`, **or**
   - Open Render **Shell** and run:
     ```bash
     php artisan db:seed --class=GameContentSeeder --force
     ```
9. Smoke-test:
   - `/` welcome page
   - create/login student by name
   - play one question
   - teacher login (`TEACHER_NAME` + code)
   - health: `/up`

### Health check

Laravel exposes `GET /up`. In Render, set Health Check Path to `/up` if prompted.

### Free-tier caveats

- The free web service **spins down** after idle time → slow first request.
- Disk is **ephemeral** → do not rely on local files for progress (MySQL holds the data).
- Build time/memory limits can fail large Docker builds; retry or use a paid instance if needed.

---

## 6. What the Docker image does

Multi-stage build:

1. **Composer** — `composer install --no-dev`
2. **Node 22** — `npm ci` + `npm run build` (PHP CLI present so Wayfinder can generate TS routes)
3. **Runtime** — `php:8.3-fpm` + nginx + supervisord  
   - Document root: `/var/www/html/public`  
   - Listens on `0.0.0.0:$PORT`  
   - No `.env` file in the image; secrets come from Render

Entrypoint:

- Requires `APP_KEY`
- Waits for MySQL
- Runs migrations if `RUN_MIGRATIONS=true`
- Optionally seeds if `RUN_CONTENT_SEED=true`
- Caches config/routes/views
- Starts nginx + php-fpm

---

## 7. Local Docker build (optional)

Docker was **not** available on the authoring Windows machine when these files were added. On a machine with Docker Desktop:

```bash
docker build -t math-treasure-hunt .
docker run --rm -p 10000:10000 ^
  -e APP_KEY=base64:YOUR_KEY_HERE ^
  -e APP_URL=http://localhost:10000 ^
  -e APP_ENV=production ^
  -e APP_DEBUG=false ^
  -e DB_CONNECTION=mysql ^
  -e DB_HOST=host.docker.internal ^
  -e DB_PORT=3306 ^
  -e DB_DATABASE=math_treasure ^
  -e DB_USERNAME=root ^
  -e DB_PASSWORD= ^
  -e TEACHER_NAME=سالمة ^
  -e TEACHER_ACCESS_CODE=12230 ^
  -e RUN_CONTENT_SEED=true ^
  math-treasure-hunt
```

Then open `http://localhost:10000`.

---

## 8. Security checklist before sharing with students

- [ ] `APP_DEBUG=false`
- [ ] Strong unique `APP_KEY`
- [ ] Changed `TEACHER_ACCESS_CODE`
- [ ] HTTPS `APP_URL`
- [ ] MySQL not publicly writable without a password
- [ ] `.env` not committed to GitHub

---

## 9. Files added for deployment

| Path | Role |
|------|------|
| `Dockerfile` | Multi-stage production image |
| `.dockerignore` | Keeps secrets and junk out of the build context |
| `docker/entrypoint.sh` | PORT binding, migrate, start processes |
| `docker/nginx/default.conf.template` | nginx → `public/`, listens on `$PORT` |
| `docker/supervisor/supervisord.conf` | Runs nginx + php-fpm |
| `docker/php/opcache.ini` | OPcache for production |
| `docker/php/uploads.ini` | Upload/memory limits |
| `docker/php/zz-docker.conf` | php-fpm keeps Render env vars (`clear_env = no`) |
| `DEPLOY.md` | This document |

Small app change for Render HTTPS proxying:

| Path | Change |
|------|--------|
| `bootstrap/app.php` | `trustProxies(at: '*')` |
| `.env.example` | Production / Render comments |

---

## 10. Your next manual steps (summary)

1. Provision **MySQL** somewhere and create an empty database.  
2. Generate **`APP_KEY`** with `php artisan key:generate --show`.  
3. Create a Render **Docker** web service from this repo.  
4. Paste all env vars (especially `APP_KEY`, `DB_*`, teacher code).  
5. Deploy and wait for a green build.  
6. Set `APP_URL` to the live URL.  
7. Seed content once (`RUN_CONTENT_SEED=true` once, or Shell command).  
8. Test student play + teacher login.  

**This repository is prepared for deployment; the live Render service and MySQL must still be created by you.**
