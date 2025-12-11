# Quick Setup Guide

Follow these steps to get Odd One Out running locally in under 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

### Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details and wait for setup to complete

### Run Database Schema
1. In Supabase Dashboard, go to SQL Editor
2. Copy the contents of `lib/supabase/schema.sql`
3. Paste and click "Run"

This will:
- Create all tables (games, players, rounds, clues, votes, word_pairs)
- Set up Row Level Security (RLS) policies
- Enable Realtime on all necessary tables
- Seed the database with 30 word pairs

### Get API Credentials
1. Go to Project Settings > API Keys
2. Copy the **Project URL**
3. Copy the **Publishable key** (starts with `sb_publishable_`)
4. Optionally copy the **Secret key** (starts with `sb_secret_`) for future use

## 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxx
```

**Note**: The Secret key is optional for this app but included for future extensibility.

## 4. Enable Anonymous Auth

1. In Supabase Dashboard, go to Authentication > Settings
2. Scroll to "Auth Providers"
3. Enable "Anonymous sign-ins"

## 5. Verify Realtime (Optional)

The schema automatically enables Realtime, but if you want to verify:
1. Go to Database > Replication
2. Check that `games`, `players`, `rounds`, `clues`, `votes` are enabled

## 6. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Testing the Game

1. Open the app in multiple browser windows or tabs
2. Create a game in one window
3. Copy the game code
4. Join the game from other windows
5. Play through a round to verify everything works

## Common Issues

**Build errors?**
- Make sure Node.js version is 18+
- Run `npm install` again

**Can't connect to Supabase?**
- Double-check your .env.local values
- Ensure anonymous auth is enabled
- Check Supabase project is not paused

**Realtime not working?**
- Realtime is enabled by default in Supabase
- Check browser console for connection errors

## Ready to Deploy?

See the main README.md for Vercel deployment instructions.
