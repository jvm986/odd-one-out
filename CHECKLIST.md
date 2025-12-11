# Setup Checklist

Use this checklist to get your game up and running.

## Initial Setup

- [ ] Install dependencies: `npm install`
- [ ] Create Supabase project at https://supabase.com
- [ ] Wait for Supabase project to finish setting up
- [ ] Go to Project Settings > API Keys
- [ ] Copy Project URL
- [ ] Copy Publishable key (starts with `sb_publishable_`)
- [ ] Optionally copy Secret key (starts with `sb_secret_`)
- [ ] Create `.env.local` from `.env.example`
- [ ] Add Supabase credentials to `.env.local`

## Database Setup

- [ ] Open Supabase SQL Editor
- [ ] Copy contents of `lib/supabase/schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify all tables created successfully
- [ ] Check that word_pairs table has 30 rows

## Authentication Setup

- [ ] Go to Supabase Authentication > Settings
- [ ] Scroll to "Auth Providers"
- [ ] Enable "Anonymous sign-ins"
- [ ] Save changes

## Local Testing

- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Create a game (should get a 6-character code)
- [ ] Open in another browser/tab
- [ ] Join the game with the code
- [ ] Verify both players appear in lobby
- [ ] Test with 3+ players
- [ ] Play through a complete game
- [ ] Verify real-time updates work
- [ ] Test refresh (session should persist)

## Deployment to Vercel

- [ ] Push code to GitHub
- [ ] Import project in Vercel
- [ ] Add environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy
- [ ] Test production deployment
- [ ] Share with your team!

## Optional Enhancements

- [ ] Add more word pairs to database
- [ ] Customize styling/colors
- [ ] Add your team's logo
- [ ] Set up analytics
- [ ] Configure custom domain

---

## Verification Commands

Test the build locally:
```bash
npm run build
npm run start
```

Check for TypeScript errors:
```bash
npx tsc --noEmit
```

## Common Issues

**Build fails?**
- Check Node.js version: `node --version` (should be 18+)
- Delete `.next` folder and `node_modules`, then reinstall

**Supabase connection error?**
- Verify `.env.local` values are correct
- Ensure no extra spaces in environment variables
- Check Supabase project is not paused

**Anonymous auth not working?**
- Confirm it's enabled in Supabase dashboard
- Check Supabase project URL is correct
- Clear browser cache and cookies

**Realtime not updating?**
- Check browser console for WebSocket errors
- Verify RLS policies are set up correctly
- Test in incognito/private browsing mode

---

✅ All done? Time to play! 🎮
