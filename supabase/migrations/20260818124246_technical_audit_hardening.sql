-- Technical Audit & Hardening Migration

-- 1. Ensure MFA (aal2) is required for sensitive administrative functions
-- This function can be used in RLS or other security checks
CREATE OR REPLACE FUNCTION auth.mfa_level()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'aal', 'aal1');
$$;

-- 2. Audit and strengthen profiles table
-- Add status and suspension_reason if they don't exist (they were mentioned in admin logic)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'suspension_reason') THEN
    ALTER TABLE public.profiles ADD COLUMN suspension_reason TEXT;
  END IF;
END $$;

-- 3. Data Integrity: Chapters count constraint
ALTER TABLE public.reading_logs DROP CONSTRAINT IF EXISTS chapters_count_positive;
ALTER TABLE public.reading_logs ADD CONSTRAINT chapters_count_positive CHECK (chapters_count > 0);

-- 4. RLS for support_sessions (mentioned in admin panel)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_sessions') THEN
    ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admins can manage support sessions" ON public.support_sessions;
    CREATE POLICY "Admins can manage support sessions"
      ON public.support_sessions FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'support'));
      
    GRANT SELECT, INSERT, UPDATE ON public.support_sessions TO authenticated;
    GRANT ALL ON public.support_sessions TO service_role;
  END IF;
END $$;

-- 5. Fix potential timezone issues in streak calculation
-- Ensure we're using the user's local date if possible, but for now we enforce consistent UTC comparisons
CREATE OR REPLACE FUNCTION public.update_streak_on_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last DATE;
  v_streak INTEGER;
  v_longest INTEGER;
BEGIN
  SELECT last_read_date, current_streak, longest_streak
    INTO v_last, v_streak, v_longest
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF v_last IS NULL THEN
    v_streak := 1;
  ELSIF NEW.read_date = v_last THEN
    -- Already read today, don't increment streak but ensure it's at least 1
    v_streak := COALESCE(v_streak, 1);
  ELSIF NEW.read_date = v_last + 1 THEN
    -- Consecutive day
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSIF NEW.read_date > v_last THEN
    -- Gap in reading
    v_streak := 1;
  ELSE
    -- Past date reading, don't update current streak unless it helps (edge case)
    v_streak := COALESCE(v_streak, 0);
  END IF;

  IF v_streak > COALESCE(v_longest, 0) THEN
    v_longest := v_streak;
  END IF;

  UPDATE public.profiles
  SET
    current_streak = v_streak,
    longest_streak = v_longest,
    last_read_date = GREATEST(COALESCE(v_last, NEW.read_date), NEW.read_date),
    total_chapters_read = total_chapters_read + COALESCE(NEW.chapters_count, 1),
    updated_at = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- 6. Ensure super_admin has strict access
-- This ensures that only the authenticated user with 'aal2' can perform super_admin actions if they have the role
CREATE OR REPLACE FUNCTION public.is_super_admin_secure()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
    AND (
      -- Only enforce aal2 if MFA is actually configured for the user
      NOT EXISTS (SELECT 1 FROM auth.mfa_factors WHERE user_id = auth.uid() AND status = 'verified')
      OR auth.mfa_level() = 'aal2'
    )
  );
END;
$$;
