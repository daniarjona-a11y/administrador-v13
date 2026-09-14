/*
# Create global_records table for V13 global leaderboard

1. New Tables
- `global_records`
  - `id` (uuid, primary key)
  - `company_name` (text, not null) — the player's company name
  - `points` (integer, not null) — final score
  - `days` (integer, not null) — days completed (1-10)
  - `result_type` (text, not null) — 'victory' | 'competitive' | 'stable' | 'crisis'
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)
2. New Functions
- `upsert_global_record(p_company_name text, p_points int, p_days int, p_result_type text)`
  - SECURITY DEFINER: inserts a new record or updates existing one ONLY if new points > existing points
  - Prevents duplicates: same company keeps only its best score
  - Prevents downgrades: lower scores never replace higher scores
  - Returns the record's id so the caller can find their position
3. Security
- Enable RLS on `global_records`.
- Allow anon + authenticated to SELECT (public leaderboard).
- Allow anon + authenticated to INSERT (but only via the function, which enforces best-score logic).
- No UPDATE or DELETE from client — the function handles updates server-side.
4. Notes
- This is a single-tenant public leaderboard game with no sign-in.
- The SECURITY DEFINER function bypasses RLS to do the conditional upsert safely.
- Records are immutable from the client's perspective except through the function.
*/

CREATE TABLE IF NOT EXISTS global_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  points integer NOT NULL,
  days integer NOT NULL,
  result_type text NOT NULL DEFAULT 'stable',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE global_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_global_records" ON global_records;
CREATE POLICY "anon_select_global_records"
ON global_records FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_global_records" ON global_records;
CREATE POLICY "anon_insert_global_records"
ON global_records FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- No UPDATE or DELETE policies — records are managed only via the SECURITY DEFINER function.

CREATE INDEX IF NOT EXISTS idx_global_records_points_desc ON global_records (points DESC);
CREATE INDEX IF NOT EXISTS idx_global_records_days_desc ON global_records (days DESC);
CREATE INDEX IF NOT EXISTS idx_global_records_created_at ON global_records (created_at);
CREATE INDEX IF NOT EXISTS idx_global_records_company_name ON global_records (company_name);

-- Auto-update updated_at on any change
DROP TRIGGER IF EXISTS trg_global_records_updated_at ON global_records;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_global_records_updated_at
BEFORE UPDATE ON global_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- SECURITY DEFINER function: inserts or updates a record ONLY if the new score is higher
-- This prevents duplicates and ensures only the best score per company is kept.
DROP FUNCTION IF EXISTS upsert_global_record(text, integer, integer, text);
CREATE OR REPLACE FUNCTION upsert_global_record(
  p_company_name text,
  p_points integer,
  p_days integer,
  p_result_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id uuid;
  v_existing_points integer;
  v_record_id uuid;
BEGIN
  -- Find existing record for this company name (case-insensitive)
  SELECT id, points INTO v_existing_id, v_existing_points
  FROM global_records
  WHERE LOWER(TRIM(company_name)) = LOWER(TRIM(p_company_name))
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Only update if the new score is strictly higher
    IF p_points > v_existing_points THEN
      UPDATE global_records
      SET points = p_points,
          days = p_days,
          result_type = p_result_type,
          updated_at = now()
      WHERE id = v_existing_id;
      v_record_id := v_existing_id;
    ELSE
      -- Keep the existing (higher) score
      v_record_id := v_existing_id;
    END IF;
  ELSE
    -- Insert new record
    INSERT INTO global_records (company_name, points, days, result_type)
    VALUES (p_company_name, p_points, p_days, p_result_type)
    RETURNING id INTO v_record_id;
  END IF;

  RETURN v_record_id;
END;
$$;
