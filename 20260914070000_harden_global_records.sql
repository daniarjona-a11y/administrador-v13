/*
  Security hardening for the public V13 leaderboard.

  The client may READ the leaderboard, but it may not INSERT/UPDATE/DELETE rows
  directly. Scores are accepted only through upsert_global_record().

  IMPORTANT: the browser is still an untrusted client. This migration prevents
  malformed/direct table writes, but a truly cheat-resistant leaderboard would
  require the server to calculate the score from the player's decisions.
*/

-- The original migration created a legacy `leaderboard` table that the V13 client no longer uses.
-- Keep it readable for backwards compatibility, but close its anonymous write path.
DROP POLICY IF EXISTS "anon_insert_leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "authenticated_insert_leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "anon_update_leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "authenticated_update_leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "anon_delete_leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "authenticated_delete_leaderboard" ON public.leaderboard;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.leaderboard FROM anon, authenticated;
GRANT SELECT ON TABLE public.leaderboard TO anon, authenticated;

-- Remove duplicate company names before creating the normalized unique index.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(company_name))
      ORDER BY points DESC, days DESC, created_at ASC, id ASC
    ) AS rn
  FROM public.global_records
)
DELETE FROM public.global_records g
USING ranked r
WHERE g.id = r.id
  AND r.rn > 1;

-- Keep company names normalized at write time and prevent case/space duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS uq_global_records_company_name_normalized
ON public.global_records ((LOWER(TRIM(company_name))));

-- Keep the table public-read only. All writes go through the RPC.
DROP POLICY IF EXISTS "anon_insert_global_records" ON public.global_records;
DROP POLICY IF EXISTS "authenticated_insert_global_records" ON public.global_records;
DROP POLICY IF EXISTS "anon_update_global_records" ON public.global_records;
DROP POLICY IF EXISTS "authenticated_update_global_records" ON public.global_records;
DROP POLICY IF EXISTS "anon_delete_global_records" ON public.global_records;
DROP POLICY IF EXISTS "authenticated_delete_global_records" ON public.global_records;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.global_records FROM anon, authenticated;
GRANT SELECT ON TABLE public.global_records TO anon, authenticated;

-- Harden the SECURITY DEFINER trigger helper too.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the RPC with validation and a safe search_path.
DROP FUNCTION IF EXISTS public.upsert_global_record(text, integer, integer, text);

CREATE OR REPLACE FUNCTION public.upsert_global_record(
  p_company_name text,
  p_points integer,
  p_days integer,
  p_result_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_name text := TRIM(COALESCE(p_company_name, ''));
  v_existing_id uuid;
  v_existing_points integer;
  v_record_points integer;
  v_record_days integer;
  v_record_created_at timestamptz;
  v_rank bigint;
  v_total bigint;
BEGIN
  -- Basic input validation. Values outside the game's supported range are rejected.
  IF v_name = '' OR CHAR_LENGTH(v_name) > 28 THEN
    RAISE EXCEPTION 'Nombre de empresa inválido';
  END IF;

  IF v_name ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION 'Nombre de empresa inválido';
  END IF;

  IF p_points IS NULL OR p_points < 0 OR p_points > 50000 THEN
    RAISE EXCEPTION 'Puntuación inválida';
  END IF;

  IF p_days IS NULL OR p_days < 1 OR p_days > 10 THEN
    RAISE EXCEPTION 'Número de días inválido';
  END IF;

  IF p_result_type IS NULL OR p_result_type NOT IN ('victory', 'competitive', 'stable', 'crisis') THEN
    RAISE EXCEPTION 'Tipo de resultado inválido';
  END IF;

  -- Atomically get-or-create the company row. The conflict target is the
  -- normalized company-name unique index, so concurrent submissions cannot
  -- create duplicate rows.
  INSERT INTO public.global_records (company_name, points, days, result_type)
  VALUES (v_name, p_points, p_days, p_result_type)
  ON CONFLICT ((LOWER(TRIM(company_name)))) DO UPDATE
    SET company_name = public.global_records.company_name
  RETURNING id, points, days, created_at
  INTO v_existing_id, v_existing_points, v_record_days, v_record_created_at;

  IF p_points > v_existing_points THEN
    UPDATE public.global_records
    SET company_name = v_name,
        points = p_points,
        days = p_days,
        result_type = p_result_type,
        updated_at = now()
    WHERE id = v_existing_id;

    v_record_points := p_points;
    v_record_days := p_days;
  ELSE
    v_record_points := v_existing_points;
  END IF;

  -- Return the exact current global rank, not merely the top 100 position.
  SELECT COUNT(*) + 1
  INTO v_rank
  FROM public.global_records r
  WHERE r.points > v_record_points
     OR (r.points = v_record_points AND r.days > v_record_days)
     OR (
       r.points = v_record_points
       AND r.days = v_record_days
       AND r.created_at < v_record_created_at
     );

  SELECT COUNT(*) INTO v_total FROM public.global_records;

  RETURN jsonb_build_object(
    'id', v_existing_id,
    'rank', v_rank,
    'total', v_total
  );
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_global_record(text, integer, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_global_record(text, integer, integer, text) TO anon, authenticated;
