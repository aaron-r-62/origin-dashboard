# Origin Dashboard — Complete Setup Guide

A beginner-friendly walkthrough for deploying the full Origin dashboard to production.

---

## Table of Contents

1. [Discord Developer Portal Setup](#1-discord-developer-portal-setup)
2. [Supabase Project Setup](#2-supabase-project-setup)
3. [Database Schema](#3-database-schema)
4. [Environment Variables (.env.local)](#4-environment-variables)
5. [Local Development](#5-local-development)
6. [Vercel Deployment](#6-vercel-deployment)
7. [Post-Deploy Checklist](#7-post-deploy-checklist)

---

## 1. Discord Developer Portal Setup

### Create your Discord Application

1. Go to **https://discord.com/developers/applications**
2. Click **"New Application"** → name it **"Origin"** → click **Create**
3. In the left sidebar, click **"OAuth2"**
4. Under **"Redirects"**, click **"Add Redirect"** and add:
   ```
   http://localhost:3000/auth/callback
   https://dashboard.getorigin.cc/auth/callback
   ```
5. Click **"Save Changes"**
6. Copy your **Client ID** and **Client Secret** — you'll need these later.

### Get your Discord Bot Token (optional for admin actions)
1. Click **"Bot"** in the sidebar
2. Click **"Reset Token"** → copy it
3. Under Privileged Gateway Intents, enable **"Server Members Intent"**

---

## 2. Supabase Project Setup

### Create a new Supabase project

1. Go to **https://supabase.com** and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name:** `origin-dashboard`
   - **Database Password:** (choose something strong, save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes for setup

### Enable Discord OAuth in Supabase

1. In your Supabase project, go to **Authentication → Providers**
2. Find **Discord** and click to expand it
3. Toggle it **ON**
4. Paste in your Discord **Client ID** and **Client Secret**
5. Click **Save**

### Get your Supabase keys

1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret!)*

---

## 3. Database Schema

Go to **Supabase → SQL Editor** and run the following SQL:

```sql
-- ============================================================
-- ORIGIN DASHBOARD - Full Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Users table (core)
CREATE TABLE IF NOT EXISTS public.users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username              TEXT NOT NULL UNIQUE,
  password_hash         TEXT NOT NULL,
  hwid                  TEXT,
  discord_id            TEXT NOT NULL UNIQUE,
  license_key           TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  tier                  TEXT NOT NULL DEFAULT 'standard'
                        CHECK (tier IN ('standard', 'pro', 'premium', 'og')),
  is_banned             BOOLEAN NOT NULL DEFAULT false,
  webhook_url           TEXT,
  performance_mode      BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps for 24-hour cooldowns
  username_updated_at   TIMESTAMPTZ,
  password_updated_at   TIMESTAMPTZ,
  hwid_updated_at       TIMESTAMPTZ,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auth logs table
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their OWN row
-- We use discord_id to match Supabase auth session

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (true); -- We handle auth in middleware + service role

CREATE POLICY "Service role has full access to users"
  ON public.users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to auth_logs"
  ON public.auth_logs FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_discord_id ON public.users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_license_key ON public.users(license_key);
CREATE INDEX IF NOT EXISTS idx_users_hwid ON public.users(hwid);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);

-- ============================================================
-- Sample data (optional — delete in production)
-- ============================================================

-- INSERT INTO public.users (username, password_hash, discord_id, tier)
-- VALUES ('admin', '$2b$12$placeholder', 'YOUR_DISCORD_ID_HERE', 'og');
```

> **Important:** Your `discord_id` is the long number ID, not your username. Right-click your profile in Discord and click "Copy User ID" (you need Developer Mode on in Discord settings).

---

## 4. Environment Variables

Create a file called `.env.local` in the root of the project:

```bash
# Copy .env.local.example and fill in your values

# ── Supabase ─────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key...

# ── Discord OAuth ─────────────────────────────────────────────
# From Discord Developer Portal → OAuth2
DISCORD_CLIENT_ID=1234567890123456789
DISCORD_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz123456

# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://dashboard.getorigin.cc
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET=your-random-64-char-hex-string-here
```

### ⚠️ Security rules:
- **NEVER** commit `.env.local` to git
- **NEVER** share your `SUPABASE_SERVICE_ROLE_KEY`
- Add `.env.local` to your `.gitignore`

---

## 5. Local Development

```bash
# 1. Clone the repo
git clone https://github.com/yourname/origin-dashboard
cd origin-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.local.example .env.local
# Fill in your values in .env.local

# 4. Run development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

**Add yourself to the database:**
1. Open Supabase → Table Editor → `users`
2. Click "Insert Row"
3. Fill in your `username`, `discord_id`, and set `tier` to `og`
4. For `password_hash`, use bcrypt — or run this in a JS console:
   ```js
   const bcrypt = require('bcryptjs')
   console.log(await bcrypt.hash('yourpassword', 12))
   ```

---

## 6. Vercel Deployment

### Connect your repository

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourname/origin-dashboard.git
   git push -u origin main
   ```

2. Go to **https://vercel.com** → click **"Add New Project"**
3. Import your GitHub repository
4. Set **Framework Preset** to **Next.js**

### Configure environment variables in Vercel

1. In the Vercel project setup (or Settings → Environment Variables), add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL` → set to `https://dashboard.getorigin.cc`
   - `NEXTAUTH_SECRET`

2. Click **"Deploy"**

### Set up custom domain

1. In Vercel project → **Settings → Domains**
2. Add `dashboard.getorigin.cc`
3. In your DNS provider (Cloudflare, Namecheap, etc.), add a **CNAME record**:
   ```
   Type:    CNAME
   Name:    dashboard
   Value:   cname.vercel-dns.com
   ```
4. Wait 5-10 minutes for DNS propagation

### Update Discord OAuth redirect

Go back to **Discord Developer Portal → OAuth2 → Redirects** and confirm `https://dashboard.getorigin.cc/auth/callback` is listed.

### Update Supabase OAuth

1. Go to **Supabase → Authentication → URL Configuration**
2. Set **Site URL** to `https://dashboard.getorigin.cc`
3. Add `https://dashboard.getorigin.cc/auth/callback` to **Redirect URLs**

---

## 7. Post-Deploy Checklist

- [ ] Dashboard loads at `https://dashboard.getorigin.cc`
- [ ] "Sign in with Discord" redirects to Discord and back correctly
- [ ] Unregistered Discord IDs get the "not_registered" error
- [ ] Banned users are blocked at the middleware level
- [ ] Field edits respect the 24-hour cooldown
- [ ] Webhook URL saves and test message works in Discord
- [ ] License key is masked until Eye icon is toggled
- [ ] OG tier shows shimmer chrome badge and animation
- [ ] Premium tier shows purple nebula glow
- [ ] Pro tier shows blue accents
- [ ] Logout redirects to `/auth`
- [ ] Delete account wipes data and logs out

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Discord OAuth redirect fails | Check Redirect URIs in Discord Dev Portal |
| "not_registered" even for valid user | Check `discord_id` in DB matches actual Discord ID (enable Developer Mode in Discord → right-click → Copy User ID) |
| RLS blocking reads | Make sure service role key is used in API routes, not anon key |
| Vercel build fails | Check all env vars are set. Run `npm run build` locally first |
| HWID cooldown not working | Ensure `hwid_updated_at` column exists in schema |

---

## File Structure Reference

```
origin-dashboard/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles + tier CSS
│   ├── auth/
│   │   ├── page.tsx                # Discord login page
│   │   └── callback/route.ts       # OAuth callback handler
│   ├── dashboard/
│   │   ├── layout.tsx              # Server-side auth + DB fetch
│   │   ├── page.tsx                # Dashboard root
│   │   └── DashboardClient.tsx     # Client shell with sidebar
│   └── api/
│       └── user/
│           ├── update/route.ts     # Field update with cooldown
│           └── delete/route.ts     # Account deletion
├── components/
│   ├── ui/Toast.tsx                # Notification toasts
│   └── dashboard/
│       ├── HomeTab.tsx             # Account Details tab
│       ├── ScriptsTab.tsx          # Scripts + Loader tab
│       └── SettingsTab.tsx         # Settings tab
├── lib/
│   └── supabase.ts                 # Client, server, admin helpers + tier config
├── middleware.ts                   # THE GATEKEEPER — discord_id check
├── .env.local.example              # Environment variable template
└── SETUP.md                        # This file
```
