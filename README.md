# Kabu Market — Vercel + Supabase Deployment Guide

Follow these steps exactly. Takes about 20 minutes.

---

## Step 1: Create your Supabase database (5 min)

1. Go to **supabase.com** → Sign up (free)
2. Click **New project** → give it a name like `kabu-market`
3. Wait for it to provision (~1 min)
4. Go to **SQL Editor** → **New Query**
5. Open `supabase-schema.sql` from this project, paste the entire contents, click **Run**
6. You should see "Success" — this creates all tables and seeds 130+ tickers

---

## Step 2: Get your Supabase credentials

In your Supabase project:
- Go to **Settings → API**
- Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- Copy **service_role** key (under "Project API keys") → this is `SUPABASE_SERVICE_ROLE_KEY`

⚠️ Use the `service_role` key for the backend — NOT the `anon` key. The service role key bypasses RLS and is safe to use in server-side API routes.

---

## Step 3: Get free API keys (5 min)

### NewsAPI
1. Go to **newsapi.org/register**
2. Sign up (free, instant, no credit card)
3. Copy your API key → `NEWSAPI_KEY`
4. Free tier: 100 requests/day — plenty

### Alpha Vantage
1. Go to **alphavantage.co/support/#api-key**
2. Fill out the short form (free, instant)
3. Copy your API key → `ALPHA_VANTAGE_KEY`
4. Free tier: 25 requests/day, 5/minute — the app respects this with built-in delays

---

## Step 4: Deploy to Vercel (5 min)

### Option A: Via GitHub (recommended)
1. Push this project to a GitHub repo
2. Go to **vercel.com** → **Add New Project**
3. Import your GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**

### Option B: Via Vercel CLI
```bash
npm install -g vercel
cd kabu-market
vercel deploy
```

---

## Step 5: Add environment variables in Vercel

1. Go to your project on **vercel.com**
2. Click **Settings → Environment Variables**
3. Add each variable from `.env.example`:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `NEWSAPI_KEY` | your newsapi key |
| `ALPHA_VANTAGE_KEY` | your alpha vantage key |
| `UPDATE_SECRET` | any random string |

4. Click **Save** then **Redeploy** (deployments don't pick up new env vars automatically)

---

## Step 6: Run the first data update

After deploying, trigger the first update manually:

```bash
curl -X POST https://your-app.vercel.app/api/trigger-update \
  -H "x-update-secret: your-random-string"
```

Or open your browser and go to:
`https://your-app.vercel.app/api/trigger-update` — though you'll need to POST to it.

The easiest way: just click "Refresh Data" on your deployed homepage.

---

## Step 7: Verify cron is set up

1. Go to **vercel.com** → your project → **Settings → Cron Jobs**
2. You should see two jobs:
   - `0 13 * * 1-5` → runs 9 AM ET weekdays
   - `0 21 * * 1-5` → runs 5 PM ET weekdays (captures closing prices)

> **Note on Vercel Hobby plan:** Hobby plan allows one cron per day. Both crons will work, but the second one may be rate-limited. Upgrade to Pro ($20/mo) for full scheduling, or just run the first one — once a day is fine.

---

## How the daily update works

Every weekday at 9 AM ET, Vercel automatically calls `/api/cron/daily-update`.

That endpoint:
1. Fetches latest financial news from NewsAPI (~70+ articles)
2. Extracts stock tickers from headlines using regex (no AI)
3. Stores articles in Supabase
4. Fetches stock prices from Alpha Vantage for top mentioned tickers
5. Stores daily ticker snapshots (price, % change, mention count)
6. Generates the daily newsletter digest
7. Everything is stored in Supabase — it persists forever

Each day builds on the previous, so charts get richer over time.

---

## Local development

```bash
cp .env.example .env.local
# Fill in your keys

npm install
npm run dev
# Open http://localhost:3000
# Click "Refresh Data" to seed local data
```

---

## File structure

```
pages/
  index.js              # Dashboard (market pulse)
  newsletters.js        # Daily digest reader
  articles.js           # All articles
  search.js             # Search
  stock/[symbol].js     # Ticker detail
  api/
    dashboard.js        # Dashboard data
    newsletters.js      # Newsletter list
    search.js           # Search
    trigger-update.js   # Manual refresh
    ticker/[symbol].js  # Stock detail
    cron/
      daily-update.js   # ← Vercel calls this daily
lib/
  supabase.js           # Supabase client
  db.js                 # All database queries
  dataEngine.js         # Daily update orchestration
  newsApi.js            # NewsAPI integration
  stockApi.js           # Alpha Vantage integration
  tickerExtractor.js    # Rule-based ticker detection
  newsletter.js         # Daily digest generator
vercel.json             # Cron schedule
supabase-schema.sql     # Database setup (run once)
```
