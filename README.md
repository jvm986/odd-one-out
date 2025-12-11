# Odd One Out

A real-time multiplayer party game for remote teams, built with Next.js, Supabase, and shadcn/ui.

## Overview

**Odd One Out** is a 10-15 minute energizer game designed for remote teams on video calls. Players receive secret words and submit clues to identify who among them is the "Odd One Out" - the player with a different (but related) word.

### Game Modes

- **Classic Mode**: The Odd One Out knows they are odd and must try to blend in
- **Blind Mode**: No one knows who the Odd One Out is, creating paranoia and suspicion for everyone

### Key Features

- Real-time multiplayer gameplay using Supabase Realtime
- Anonymous authentication (no signup required)
- Session persistence across page refreshes
- 6-character shareable game codes
- Multiple concurrent games support
- Mobile-friendly responsive design
- Automatic scoring and leaderboard

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Realtime, Auth)
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- pnpm 9+ installed (`npm install -g pnpm` or see [pnpm.io](https://pnpm.io))
- A Supabase account (free tier works)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd odd-one-out
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to Project Settings > API Keys
4. Copy your **Project URL** and **Publishable key** (starts with `sb_publishable_`)

#### Run the Database Schema

1. In your Supabase project, go to the SQL Editor
2. Open the file `lib/supabase/schema.sql` from this project
3. Copy the entire contents and paste it into the SQL Editor
4. Click "Run" to execute the schema creation

This will:
- Create all necessary tables (games, players, rounds, clues, votes, word_pairs)
- Set up Row Level Security (RLS) policies compatible with new Supabase API keys
- Enable Realtime on all tables for live multiplayer updates
- Seed the database with 30 word pairs

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxx
```

**Note**: You only need the Publishable key for this app. The Secret key is included for future extensibility but is not currently used.

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Available Scripts

```bash
pnpm dev           # Start development server with Turbopack
pnpm build         # Build for production
pnpm start         # Start production server
pnpm type-check    # Run TypeScript type checking
pnpm lint          # Lint code with Biome
pnpm lint:fix      # Lint and auto-fix issues
pnpm format        # Format code with Biome
pnpm check         # Run linting + formatting check
pnpm check:fix     # Auto-fix all linting and formatting issues
pnpm precommit     # Run all checks before committing
```

## How to Play

### For the Host

1. **Create a Game**
   - Enter your name
   - Choose Classic or Blind mode
   - Click "Create New Game"
   - Share the 6-character code with players

2. **In the Lobby**
   - Wait for at least 3 players to join
   - Click "Start Game" when ready

3. **During Each Round**
   - Submit your clue based on your word
   - Click "Go to Voting" when ready
   - Click "Reveal & Score" to see results
   - Choose "Next Round" or "End Game"

### For Players

1. **Join a Game**
   - Enter your name
   - Enter the game code shared by the host
   - Click "Join Game"

2. **Each Round**
   - Read your secret word
   - Submit a clue related to your word
   - Vote for who you think is the Odd One Out
   - See results and updated scores

### Scoring

- **Regular Players**: +1 point for correctly identifying the Odd One Out
- **Odd One Out**: +2 points if fewer than half the players vote for them

## Project Structure

```
odd-one-out/
├── app/
│   ├── game/[id]/          # Dynamic game page
│   ├── page.tsx            # Home page
│   └── layout.tsx          # Root layout
├── components/
│   ├── game/               # Game phase components
│   │   ├── GameContainer.tsx
│   │   ├── LobbyPhase.tsx
│   │   ├── CluePhase.tsx
│   │   ├── VotingPhase.tsx
│   │   ├── RevealPhase.tsx
│   │   └── FinishedPhase.tsx
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── actions/            # Server actions
│   │   └── game.ts
│   ├── data/               # Data fetching utilities
│   │   └── game.ts
│   ├── supabase/           # Supabase client setup
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── schema.sql
│   ├── types/              # TypeScript types
│   │   └── database.ts
│   └── utils.ts            # Utility functions
├── middleware.ts           # Auth middleware
└── .env.local             # Environment variables
```

## Database Schema

### Key Tables

- **games**: Game state, code, host, mode, phase, rounds
- **players**: Player info, scores, game association
- **rounds**: Word assignments, odd player per round
- **clues**: Player clues for each round
- **votes**: Player votes for each round
- **word_pairs**: Curated list of word pairs for the game

See `lib/supabase/schema.sql` for the complete schema.

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `SUPABASE_SECRET_KEY` (optional, for future use)

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes!

### Production Checklist

- ✅ Supabase project is in production mode
- ✅ Environment variables are set in Vercel
- ✅ Database schema is applied
- ✅ RLS policies are enabled
- ✅ CORS is configured in Supabase if needed

## Development

### Key Technologies

- **Next.js App Router**: Modern React framework with server components
- **Server Actions**: Type-safe server-side mutations
- **Supabase Realtime**: Live updates for multiplayer functionality
- **Anonymous Auth**: Persistent sessions without user signup
- **shadcn/ui**: Beautiful, accessible component library

### Code Organization

- **Server Actions** (`lib/actions/`): Handle all game logic server-side to prevent cheating
- **Data Fetching** (`lib/data/`): Centralized data queries
- **Client Components**: Use Supabase Realtime for live updates
- **Middleware**: Handles anonymous auth session creation and refresh

### Adding More Word Pairs

Add more word pairs directly in Supabase:

```sql
INSERT INTO word_pairs (group_word, odd_word, category) VALUES
  ('Day', 'Night', 'Time'),
  ('Hot', 'Cold', 'Temperature');
```

## Troubleshooting

### Anonymous auth not working

- Check that your Supabase project has anonymous sign-ins enabled
- Go to Authentication > Settings > Providers and enable Anonymous sign-ins

### Realtime not updating (players don't see live updates)

- The schema.sql should automatically enable Realtime on all tables
- If updates still require refresh, go to Database > Replication in Supabase
- Verify these tables have Realtime enabled: games, players, rounds, clues, votes
- Check browser console for WebSocket connection errors

### Game code not found

- Verify the database schema was applied correctly
- Check that the games table exists and has the code column

### Build errors

- Make sure all environment variables are set
- Run `pnpm install` to ensure all dependencies are installed
- Check Node.js version is 18+
- Check pnpm version is 9+ with `pnpm --version`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your team!

## Credits

Built with love for remote teams everywhere.

---

**Enjoy the game!** Have fun catching the Odd One Out! 🎮
