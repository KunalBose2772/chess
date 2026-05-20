-- ============================================================
-- ChessOnline Database Schema (Supabase / PostgreSQL)
-- Based on: docs/deep-research-report.md — Data Schemas section
-- Run this in the Supabase SQL Editor to bootstrap your database
-- ============================================================

-- PROFILES: extends auth.users with username + rating
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  rating      INT  NOT NULL DEFAULT 1200,
  avatar_url  TEXT,
  games_played INT NOT NULL DEFAULT 0,
  wins        INT NOT NULL DEFAULT 0,
  losses      INT NOT NULL DEFAULT 0,
  draws       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- GAMES: one row per game
CREATE TABLE IF NOT EXISTS games (
  id           SERIAL PRIMARY KEY,
  white_id     UUID REFERENCES auth.users NOT NULL,
  black_id     UUID REFERENCES auth.users NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('pending','active','ended')),
  result       TEXT CHECK (result IN ('1-0','0-1','1/2-1/2')),
  time_control TEXT NOT NULL DEFAULT 'blitz',
  fen          TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  ended_at     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- MOVES: every half-move (ply) in a game
CREATE TABLE IF NOT EXISTS moves (
  id          SERIAL PRIMARY KEY,
  game_id     INT REFERENCES games(id) ON DELETE CASCADE,
  move_number INT NOT NULL,
  san         TEXT NOT NULL,
  from_sq     CHAR(2) NOT NULL,
  to_sq       CHAR(2) NOT NULL,
  promotion   CHAR(1),
  fen_after   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT: in-game chat messages
CREATE TABLE IF NOT EXISTS game_chat (
  id         SERIAL PRIMARY KEY,
  game_id    INT  REFERENCES games(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users NOT NULL,
  username   TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PUZZLES: static puzzle database (admin-populated)
CREATE TABLE IF NOT EXISTS puzzles (
  id          SERIAL PRIMARY KEY,
  fen         TEXT NOT NULL,
  moves       TEXT NOT NULL,   -- space-separated expected moves in UCI format
  rating      INT  NOT NULL DEFAULT 1200,
  themes      TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE games      ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves      ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_chat  ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read; only owner can update
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Games: anyone can read; participants can update
CREATE POLICY "Games are viewable by everyone"
  ON games FOR SELECT USING (true);
CREATE POLICY "Participants can update their games"
  ON games FOR UPDATE USING (
    auth.uid() = white_id OR auth.uid() = black_id
  );
CREATE POLICY "Authenticated users can create games"
  ON games FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Moves: readable by all, insertable only by game participants
CREATE POLICY "Moves are viewable by everyone"
  ON moves FOR SELECT USING (true);
CREATE POLICY "Game participants can insert moves"
  ON moves FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE id = game_id
        AND (white_id = auth.uid() OR black_id = auth.uid())
    )
  );

-- Chat: readable by all, insertable only by participants
CREATE POLICY "Chat is viewable by everyone"
  ON game_chat FOR SELECT USING (true);
CREATE POLICY "Participants can insert chat"
  ON game_chat FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create profile on new user signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, rating)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    1200
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
