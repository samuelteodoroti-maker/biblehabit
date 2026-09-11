DROP FUNCTION IF EXISTS public.get_reading_stats(uuid);

CREATE FUNCTION public.get_reading_stats(_user_id uuid)
RETURNS TABLE(
  current_streak integer,
  longest_streak integer,
  total_read_days integer,
  total_chapters integer,
  first_read_date date,
  last_read_date date,
  longest_gap integer,
  weekly_average numeric,
  monthly_average numeric,
  today_local date,
  tz_name text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_tz text;
  v_today date;
  v_first date;
  v_last date;
  v_days integer := 0;
  v_chapters integer := 0;
  v_gap integer := 0;
  v_span numeric;
  v_current integer := 0;
  v_longest integer := 0;
BEGIN
  IF auth.uid() IS NULL OR (auth.uid() <> _user_id AND NOT public.has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(p.timezone, 'America/Sao_Paulo') INTO v_tz FROM public.profiles p WHERE p.id = _user_id;
  v_tz := COALESCE(v_tz, 'America/Sao_Paulo');
  v_today := (now() AT TIME ZONE v_tz)::date;

  SELECT s.current_streak, s.longest_streak INTO v_current, v_longest
  FROM public.calculate_user_streak(_user_id) s;

  SELECT count(DISTINCT rl.reading_date)::int, MIN(rl.reading_date), MAX(rl.reading_date), COALESCE(SUM(rl.chapters_count), 0)::int
  INTO v_days, v_first, v_last, v_chapters
  FROM public.reading_logs rl
  WHERE rl.user_id = _user_id AND rl.reading_date <= v_today;

  WITH d AS (
    SELECT DISTINCT rl.reading_date AS rd FROM public.reading_logs rl
    WHERE rl.user_id = _user_id AND rl.reading_date <= v_today
  ),
  gaps AS (
    SELECT (d.rd - lag(d.rd) OVER (ORDER BY d.rd))::int - 1 AS gap FROM d
  )
  SELECT COALESCE(MAX(g.gap), 0) INTO v_gap FROM gaps g WHERE g.gap > 0;

  v_span := GREATEST(COALESCE(v_today - v_first, 0) + 1, 1);

  RETURN QUERY SELECT
    v_current,
    v_longest,
    COALESCE(v_days, 0),
    COALESCE(v_chapters, 0),
    v_first,
    v_last,
    COALESCE(v_gap, 0),
    CASE WHEN v_days = 0 THEN 0 ELSE round(v_days / (v_span / 7.0), 2) END,
    CASE WHEN v_days = 0 THEN 0 ELSE round(v_days / (v_span / 30.0), 2) END,
    v_today,
    v_tz;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_reading_stats(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_reading_stats(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.calculate_user_streak(_user_id uuid)
RETURNS TABLE(current_streak integer, longest_streak integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_tz text;
  v_today date;
  v_current integer := 0;
  v_longest integer := 0;
BEGIN
  SELECT COALESCE(p.timezone, 'America/Sao_Paulo') INTO v_tz FROM public.profiles p WHERE p.id = _user_id;
  v_tz := COALESCE(v_tz, 'America/Sao_Paulo');
  v_today := (now() AT TIME ZONE v_tz)::date;

  WITH d AS (
    SELECT DISTINCT rl.reading_date AS rd
    FROM public.reading_logs rl
    WHERE rl.user_id = _user_id AND rl.reading_date <= v_today
  ),
  g AS (
    SELECT d.rd, d.rd - (row_number() OVER (ORDER BY d.rd))::int AS grp FROM d
  ),
  runs AS (
    SELECT g.grp, count(*)::int AS len, max(g.rd) AS run_end FROM g GROUP BY g.grp
  )
  SELECT COALESCE(MAX(runs.len), 0),
         COALESCE(MAX(runs.len) FILTER (WHERE runs.run_end >= v_today - 1), 0)
  INTO v_longest, v_current
  FROM runs;

  RETURN QUERY SELECT v_current, v_longest;
END;
$function$;

REVOKE ALL ON FUNCTION public.calculate_user_streak(uuid) FROM anon, PUBLIC;

CREATE OR REPLACE FUNCTION public.validate_reading_log()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_tz text;
BEGIN
  SELECT COALESCE(p.timezone, 'America/Sao_Paulo') INTO v_tz FROM public.profiles p WHERE p.id = NEW.user_id;
  IF NEW.reading_date > ((now() AT TIME ZONE COALESCE(v_tz, 'America/Sao_Paulo'))::date) THEN
    RAISE EXCEPTION 'reading_date cannot be in the future';
  END IF;
  RETURN NEW;
END;
$function$;