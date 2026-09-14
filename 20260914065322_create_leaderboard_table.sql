/*
# Create leaderboard table for El Reto Empresarial game

1. New Tables
- `leaderboard`
  - `id` (uuid, primary key)
  - `company_name` (text, not null) — the player's company name
  - `points` (integer, not null) — final score
  - `days_survived` (integer, not null) — how many days the company lasted (1-10)
  - `result_type` (text, not null) — 'victory' | 'competitive' | 'stable' | 'crisis'
  - `created_at` (timestamptz, default now)
2. Security
- Enable RLS on `leaderboard`.
- Allow anon + authenticated to read all records (public leaderboard).
- Allow anon + authenticated to insert new records (public game, no auth).
- No updates or deletes from the client — records are immutable once submitted.
3. Notes
- This is a single-tenant public leaderboard game with no sign-in.
- All players share the same leaderboard.
- Records are write-once (insert + select only).
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  points integer NOT NULL,
  days_survived integer NOT NULL,
  result_type text NOT NULL DEFAULT 'stable',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard;
CREATE POLICY "anon_select_leaderboard"
ON leaderboard FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard;
CREATE POLICY "anon_insert_leaderboard"
ON leaderboard FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leaderboard_points_desc ON leaderboard (points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard (created_at DESC);
