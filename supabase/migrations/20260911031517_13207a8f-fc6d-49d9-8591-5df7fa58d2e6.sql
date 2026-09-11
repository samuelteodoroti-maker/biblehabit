REVOKE ALL ON FUNCTION public.get_reading_stats(uuid) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.get_daily_reading_summary(uuid, date, date) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.calculate_user_streak(uuid) FROM anon, PUBLIC;

-- log_reading_atomic: exige usuário autenticado e proíbe registrar em nome de terceiros
CREATE OR REPLACE FUNCTION public.log_reading_atomic(p_user_id uuid, p_reading_date date, p_chapters_count integer, p_plan_id uuid, p_notes text, p_duration_minutes integer, p_passages jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_log_id uuid;
  v_passage jsonb;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  INSERT INTO public.reading_logs (user_id, reading_date, chapters_count, plan_id, notes, duration_minutes)
  VALUES (p_user_id, p_reading_date, p_chapters_count, p_plan_id, p_notes, p_duration_minutes)
  RETURNING id INTO v_log_id;

  FOR v_passage IN SELECT * FROM jsonb_array_elements(COALESCE(p_passages, '[]'::jsonb))
  LOOP
    INSERT INTO public.reading_passages (
      reading_log_id, user_id, book_id, start_chapter, start_verse, end_chapter, end_verse, is_full_chapter
    ) VALUES (
      v_log_id, p_user_id,
      v_passage->>'book_id',
      (v_passage->>'start_chapter')::integer,
      (v_passage->>'start_verse')::integer,
      (v_passage->>'end_chapter')::integer,
      (v_passage->>'end_verse')::integer,
      (v_passage->>'is_full_chapter')::boolean
    );
  END LOOP;

  IF p_plan_id IS NOT NULL THEN
    UPDATE public.reading_plans
    SET completed_days = LEAST(COALESCE(completed_days, 0) + 1, COALESCE(total_days, 2147483647)),
        updated_at = now()
    WHERE id = p_plan_id AND user_id = p_user_id;
  END IF;

  RETURN v_log_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.log_reading_atomic(uuid, date, integer, uuid, text, integer, jsonb) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_reading_atomic(uuid, date, integer, uuid, text, integer, jsonb) TO authenticated;