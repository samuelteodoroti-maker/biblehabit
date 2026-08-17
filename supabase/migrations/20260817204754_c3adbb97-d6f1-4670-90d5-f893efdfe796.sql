-- 2. Enhance user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL REFERENCES auth.users(id),
    role public.app_role NOT NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    affected_user_id uuid REFERENCES auth.users(id),
    reason text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create user_access_events table
CREATE TABLE IF NOT EXISTS public.user_access_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.user_access_events TO authenticated;
GRANT ALL ON public.user_access_events TO service_role;

ALTER TABLE public.user_access_events ENABLE ROW LEVEL SECURITY;

-- 5. Create support_sessions table
CREATE TABLE IF NOT EXISTS public.support_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL REFERENCES auth.users(id),
    target_user_id uuid NOT NULL REFERENCES auth.users(id),
    reason text NOT NULL,
    status text DEFAULT 'active',
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    closed_at timestamptz
);

-- Support session status check using trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_support_session_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'expired', 'closed') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_support_session_status
BEFORE INSERT OR UPDATE ON public.support_sessions
FOR EACH ROW EXECUTE FUNCTION public.validate_support_session_status();

GRANT SELECT, INSERT, UPDATE ON public.support_sessions TO authenticated;
GRANT ALL ON public.support_sessions TO service_role;

ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Update has_role function (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 7. Add specific has_any_role helper
CREATE OR REPLACE FUNCTION public.has_any_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    from public.user_roles
    where user_id = _user_id
      and role IN ('super_admin', 'admin', 'support', 'analyst')
  )
$$;

-- 8. Policies for admin tables
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT TO authenticated USING (public.has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can view access events" ON public.user_access_events
    FOR SELECT TO authenticated USING (public.has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can view and manage support sessions" ON public.support_sessions
    FOR ALL TO authenticated USING (public.has_any_admin_role(auth.uid()));

-- 9. Profile status logic
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS suspension_reason text;

-- Profile status check trigger
CREATE OR REPLACE FUNCTION public.validate_profile_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_profile_status
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_profile_status();

-- 10. Initial super_admin (Current user)
INSERT INTO public.user_roles (user_id, role)
SELECT auth.uid(), 'super_admin'::public.app_role
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Revoke public execute on security definer functions to address linter warnings
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_any_admin_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_support_session_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_profile_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_any_admin_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_support_session_status() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_profile_status() TO authenticated, service_role;
