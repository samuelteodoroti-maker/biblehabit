-- 1. Preferência de fuso horário no perfil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Sao_Paulo';

-- 2. Índice para consultas por usuário/data
CREATE INDEX IF NOT EXISTS reading_logs_user_date_idx ON public.reading_logs (user_id, reading_date);

-- 3. Remove trigger legada quebrada (referenciava coluna inexistente NEW.read_date)
DROP FUNCTION IF EXISTS public.update_streak_on_log() CASCADE;

-- 4. Cálculo de ofensiva corrigido (fuso do usuário + não zera ao encontrar lacunas antigas)
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
  SELECT COALESCE(timezone, 'America/Sao_Paulo') INTO v_tz FROM public.profiles WHERE id = _user_id;
  v_tz := COALESCE(v_tz, 'America/Sao_Paulo');
  v_today := (now() AT TIME ZONE v_tz)::date;

  WITH d AS (
    SELECT DISTINCT reading_date
    FROM public.reading_logs
    WHERE user_id = _user_id AND reading_date <= v_today
  ),
  g AS (
    SELECT reading_date,
           reading_date - (row_number() OVER (ORDER BY reading_date))::int AS grp
    FROM d
  ),
  runs AS (
    SELECT grp, count(*)::int AS len, max(reading_date) AS run_end
    FROM g
    GROUP BY grp
  )
  SELECT
    COALESCE(MAX(len), 0),
    COALESCE(MAX(len) FILTER (WHERE run_end >= v_today - 1), 0)
  INTO v_longest, v_current
  FROM runs;

  RETURN QUERY SELECT v_current, v_longest;
END;
$function$;

-- 5. Fonte única de verdade das estatísticas
CREATE OR REPLACE FUNCTION public.get_reading_stats(_user_id uuid)
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
  timezone text
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

  SELECT COALESCE(timezone, 'America/Sao_Paulo') INTO v_tz FROM public.profiles WHERE id = _user_id;
  v_tz := COALESCE(v_tz, 'America/Sao_Paulo');
  v_today := (now() AT TIME ZONE v_tz)::date;

  SELECT s.current_streak, s.longest_streak INTO v_current, v_longest
  FROM public.calculate_user_streak(_user_id) s;

  SELECT count(DISTINCT reading_date)::int, MIN(reading_date), MAX(reading_date), COALESCE(SUM(chapters_count), 0)::int
  INTO v_days, v_first, v_last, v_chapters
  FROM public.reading_logs
  WHERE user_id = _user_id AND reading_date <= v_today;

  WITH d AS (
    SELECT DISTINCT reading_date FROM public.reading_logs
    WHERE user_id = _user_id AND reading_date <= v_today
  ),
  gaps AS (
    SELECT (reading_date - lag(reading_date) OVER (ORDER BY reading_date))::int - 1 AS gap FROM d
  )
  SELECT COALESCE(MAX(gap), 0) INTO v_gap FROM gaps WHERE gap > 0;

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

REVOKE ALL ON FUNCTION public.get_reading_stats(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_reading_stats(uuid) TO authenticated;

-- 6. Resumo diário por intervalo (calendário)
CREATE OR REPLACE FUNCTION public.get_daily_reading_summary(_user_id uuid, _from date, _to date)
RETURNS TABLE(reading_date date, logs_count integer, chapters_count integer, last_logged_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR (auth.uid() <> _user_id AND NOT public.has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT rl.reading_date,
         count(*)::int,
         COALESCE(SUM(rl.chapters_count), 0)::int,
         MAX(rl.created_at)
  FROM public.reading_logs rl
  WHERE rl.user_id = _user_id AND rl.reading_date BETWEEN _from AND _to
  GROUP BY rl.reading_date
  ORDER BY rl.reading_date;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_daily_reading_summary(uuid, date, date) FROM public;
GRANT EXECUTE ON FUNCTION public.get_daily_reading_summary(uuid, date, date) TO authenticated;

-- 7. Bloqueia registros em datas futuras e em nome de outro usuário
CREATE OR REPLACE FUNCTION public.validate_reading_log()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_tz text;
BEGIN
  SELECT COALESCE(timezone, 'America/Sao_Paulo') INTO v_tz FROM public.profiles WHERE id = NEW.user_id;
  IF NEW.reading_date > ((now() AT TIME ZONE COALESCE(v_tz, 'America/Sao_Paulo'))::date) THEN
    RAISE EXCEPTION 'reading_date cannot be in the future';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS reading_logs_validate ON public.reading_logs;
CREATE TRIGGER reading_logs_validate BEFORE INSERT OR UPDATE ON public.reading_logs
FOR EACH ROW EXECUTE FUNCTION public.validate_reading_log();

-- 8. Recalcula os contadores existentes de todos os perfis (sem apagar dados)
UPDATE public.profiles p
SET current_streak = s.current_streak,
    longest_streak = s.longest_streak,
    total_chapters_read = COALESCE(t.total, 0),
    last_read_date = t.last_date
FROM (SELECT id FROM public.profiles) ids
LEFT JOIN LATERAL (
  SELECT SUM(chapters_count)::int AS total, MAX(reading_date) AS last_date
  FROM public.reading_logs WHERE user_id = ids.id
) t ON true
LEFT JOIN LATERAL public.calculate_user_streak(ids.id) s ON true
WHERE p.id = ids.id;