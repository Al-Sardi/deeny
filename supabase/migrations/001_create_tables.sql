-- ============================================================
-- Deeny: Supabase schema for prayer tracking data
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. PRAYERS — one row per user per day
CREATE TABLE prayers (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date       date        NOT NULL,
  fajr       boolean     DEFAULT false NOT NULL,
  dhuhr      boolean     DEFAULT false NOT NULL,
  asr        boolean     DEFAULT false NOT NULL,
  maghrib    boolean     DEFAULT false NOT NULL,
  isha       boolean     DEFAULT false NOT NULL,
  streak     integer     DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prayers"
  ON prayers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayers"
  ON prayers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers"
  ON prayers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_prayers_user_date ON prayers(user_id, date DESC);


-- 2. ACHIEVEMENTS — append-only unlock records
CREATE TABLE achievements (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id text        NOT NULL,
  unlocked_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. TASBIH_DATA — one row per user (running counter)
CREATE TABLE tasbih_data (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  count      integer     DEFAULT 0 NOT NULL,
  target     integer,
  total      integer     DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE tasbih_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasbih"
  ON tasbih_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasbih"
  ON tasbih_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasbih"
  ON tasbih_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
