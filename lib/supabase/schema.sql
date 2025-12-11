-- Odd One Out Game Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game modes enum
CREATE TYPE game_mode AS ENUM ('classic', 'blind');

-- Game phases enum
CREATE TYPE game_phase AS ENUM ('lobby', 'clue', 'voting', 'reveal', 'finished');

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  mode game_mode NOT NULL DEFAULT 'classic',
  phase game_phase NOT NULL DEFAULT 'lobby',
  current_round INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- from Supabase auth (anonymous user)
  display_name VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Rounds table
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  group_word VARCHAR(100) NOT NULL,
  odd_word VARCHAR(100) NOT NULL,
  odd_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, round_number)
);

-- Clues table
CREATE TABLE clues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  clue_text VARCHAR(200) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, player_id)
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  suspect_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, voter_id),
  CHECK (voter_id != suspect_id)
);

-- Word pairs table (seed data)
CREATE TABLE word_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_word VARCHAR(100) NOT NULL,
  odd_word VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_rounds_game_id ON rounds(game_id);
CREATE INDEX idx_clues_round_id ON clues(round_id);
CREATE INDEX idx_votes_round_id ON votes(round_id);
CREATE INDEX idx_games_code ON games(code);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_pairs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Permissive policies for anonymous users (game uses anonymous auth)

-- Games
CREATE POLICY "Anyone can view games" ON games FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create games" ON games FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update games" ON games FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete games" ON games FOR DELETE TO anon, authenticated USING (true);

-- Players
CREATE POLICY "Anyone can view players" ON players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create players" ON players FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON players FOR UPDATE TO anon, authenticated USING (true);

-- Rounds
CREATE POLICY "Anyone can view rounds" ON rounds FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create rounds" ON rounds FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update rounds" ON rounds FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete rounds" ON rounds FOR DELETE TO anon, authenticated USING (true);

-- Clues
CREATE POLICY "Anyone can view clues" ON clues FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create clues" ON clues FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update clues" ON clues FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete clues" ON clues FOR DELETE TO anon, authenticated USING (true);

-- Votes
CREATE POLICY "Anyone can view votes" ON votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create votes" ON votes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update votes" ON votes FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete votes" ON votes FOR DELETE TO anon, authenticated USING (true);

-- Word pairs
CREATE POLICY "Anyone can view word pairs" ON word_pairs FOR SELECT TO anon, authenticated USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed word pairs
INSERT INTO word_pairs (group_word, odd_word, category) VALUES
  ('Pizza', 'Burger', 'Food'),
  ('Cat', 'Dog', 'Pets'),
  ('Beach', 'Mountains', 'Vacation'),
  ('Coffee', 'Tea', 'Beverages'),
  ('Marvel', 'DC', 'Comics'),
  ('Summer', 'Winter', 'Seasons'),
  ('Book', 'Movie', 'Entertainment'),
  ('Morning', 'Evening', 'Time of Day'),
  ('Sweet', 'Salty', 'Taste'),
  ('City', 'Countryside', 'Living'),
  ('Phone', 'Laptop', 'Technology'),
  ('Running', 'Swimming', 'Exercise'),
  ('Chocolate', 'Vanilla', 'Flavors'),
  ('Gold', 'Silver', 'Metals'),
  ('Sunrise', 'Sunset', 'Sky'),
  ('Cake', 'Pie', 'Desserts'),
  ('Guitar', 'Piano', 'Instruments'),
  ('Football', 'Basketball', 'Sports'),
  ('Rain', 'Snow', 'Weather'),
  ('Red', 'Blue', 'Colors'),
  ('Apple', 'Android', 'Mobile OS'),
  ('Star Wars', 'Star Trek', 'Sci-Fi'),
  ('Harry Potter', 'Lord of the Rings', 'Fantasy'),
  ('Netflix', 'Disney+', 'Streaming'),
  ('Instagram', 'TikTok', 'Social Media'),
  ('Spotify', 'Apple Music', 'Music Streaming'),
  ('Uber', 'Lyft', 'Ride Sharing'),
  ('Breakfast', 'Dinner', 'Meals'),
  ('Ocean', 'Desert', 'Nature'),
  ('Comedy', 'Drama', 'Genres');

-- Enable Realtime for real-time multiplayer updates
-- This allows clients to subscribe to database changes
ALTER publication supabase_realtime ADD TABLE games;
ALTER publication supabase_realtime ADD TABLE players;
ALTER publication supabase_realtime ADD TABLE rounds;
ALTER publication supabase_realtime ADD TABLE clues;
ALTER publication supabase_realtime ADD TABLE votes;
