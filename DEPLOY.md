# Deploy to Vercel

Short guide to deploy **Pehchaan Travels** (Next.js + Prisma + PostgreSQL) to Vercel.

## 1. Prerequisites

- The code pushed to GitHub: `https://github.com/vovegenpeter-ai/Pehchaatravels`
- A **hosted PostgreSQL database** — the app needs a real Postgres in production.
  Free options: [Neon](https://neon.tech), [Supabase](https://supabase.com), or Railway.
  Copy the connection string (looks like
  `postgresql://user:password@host/db?sslmode=require`).
- A [Vercel](https://vercel.com) account (sign in with GitHub for the easiest flow).

## 2. One-time: create the schema + seed the production database

Run these **from this project folder**, pointing at the production database
(not the local dev DB):

```bash
# Linux/macOS/Git Bash — replace the URL with your production Postgres
export DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Windows PowerShell
$env:DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
```

```bash
npx prisma db push      # create tables from prisma/schema.prisma
npm run db:seed         # admin user + initial tours/hotels/destinations
```

The seed is idempotent (safe to re-run). Set `ADMIN_EMAIL` / `ADMIN_PASSWORD`
env vars first if you want a different admin login than the defaults.

## 3. Import the project to Vercel

1. In Vercel: **Add New → Project → Import** the `Pehchaatravels` GitHub repo.
2. Framework is auto-detected as **Next.js** — keep the defaults:
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: `.next` (auto)

## 4. Environment variables

Add these in **Project → Settings → Environment Variables** (copy the keys from
[`.env.example`](../.env.example)):

| Name              | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`    | Your production Postgres connection string (with `sslmode=require`) |
| `ADMIN_JWT_SECRET`| Long random string (`openssl rand -base64 32`)                      |
| `USER_JWT_SECRET` | Long random string — optional, falls back to `ADMIN_JWT_SECRET`     |
| `ADMIN_EMAIL`     | Admin login email used at seed time                                  |
| `ADMIN_PASSWORD`  | Admin login password (seed only — change it after first login)       |
| `ADMIN_NAME`      | Admin display name                                                    |
| `NEXT_PUBLIC_APP_URL` | Your live site domain (e.g. `https://pehchaantravels.vercel.app`) |
| `SMTP_HOST`       | SMTP host (e.g. `smtp.gmail.com`)                                  |
| `SMTP_PORT`       | SMTP port (e.g. `587`)                                             |
| `SMTP_USER`       | Sender email address (e.g. `your-email@gmail.com`)                 |
| `SMTP_PASS`       | Gmail App Password or SMTP key                                     |
| `SMTP_FROM`       | Sender format: `"Pehchaan Travels" <your-email@gmail.com>`         |

Then **Deploy** (or Redeploy) — the build works without a database because
every data page is dynamic (server-rendered on demand).

## 5. Notes & limits

- **Admin image uploads** write to `public/uploads`, which does **not persist**
  on Vercel's serverless filesystem. Uploaded images will work for the current
  instance only. For real uploads, use [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
  or another object store. Images already committed in `public/uploads` deploy
  and persist fine.
- **First visit** may be slow (cold start) — normal for serverless.
- If the site ever shows DB errors, check the `DATABASE_URL` is reachable from
  Vercel (Neon/Supabase connection URLs work out of the box) and that the
  tables were created in step 2.
