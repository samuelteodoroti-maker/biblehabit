-- Atomic reading registration function
CREATE OR REPLACE FUNCTION public.log_reading_atomic(
  p_user_id uuid,
  p_reading_date date,
  p_chapters_count integer,
  p_plan_id uuid,
  p_notes text,
  p_duration_minutes integer,
  p_passages jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
  v_passage jsonb;
BEGIN
  -- Insert log
  INSERT INTO public.reading_logs (
    user_id,
    reading_date,
    chapters_count,
    plan_id,
    notes,
    duration_minutes
  ) VALUES (
    p_user_id,
    p_reading_date,
    p_chapters_count,
    p_plan_id,
    p_notes,
    p_duration_minutes
  ) RETURNING id INTO v_log_id;

  -- Insert passages
  FOR v_passage IN SELECT * FROM jsonb_array_elements(p_passages)
  LOOP
    INSERT INTO public.reading_passages (
      reading_log_id,
      user_id,
      book_id,
      start_chapter,
      start_verse,
      end_chapter,
      end_verse,
      is_full_chapter
    ) VALUES (
      v_log_id,
      p_user_id,
      v_passage->>'book_id',
      (v_passage->>'start_chapter')::integer,
      (v_passage->>'start_verse')::integer,
      (v_passage->>'end_chapter')::integer,
      (v_passage->>'end_verse')::integer,
      (v_passage->>'is_full_chapter')::boolean
    );
  END LOOP;

  -- Update plan progress if applicable
  IF p_plan_id IS NOT NULL THEN
    UPDATE public.reading_plans
    SET completed_days = COALESCE(completed_days, 0) + 1,
        updated_at = now()
    WHERE id = p_plan_id;
  END IF;

  RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_reading_atomic TO authenticated;

-- Ensure audit logs exist
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    details text,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_audit_logs' 
        AND policyname = 'Admins can view all audit logs'
    ) THEN
        CREATE POLICY "Admins can view all audit logs"
        ON public.admin_audit_logs
        FOR SELECT
        TO authenticated
        USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'analyst'));
    END IF;
END $$;
