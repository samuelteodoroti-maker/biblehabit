
-- Bible Habit Security Hardening: Super Admin Configuration
-- User: samuelteodoro.ti@gmail.com
-- UUID: 5cf509ab-98fb-4816-a3f8-39faf22b4864

DO $$ 
DECLARE
    v_target_user_id uuid := '5cf509ab-98fb-4816-a3f8-39faf22b4864';
BEGIN
    -- 1. Hardening: Ensure only this specific UUID can be super_admin
    DELETE FROM public.user_roles 
    WHERE role = 'super_admin' 
    AND user_id != v_target_user_id;

    -- 2. Assign super_admin to the verified user
    INSERT INTO public.user_roles (user_id, role, created_by)
    VALUES (v_target_user_id, 'super_admin', v_target_user_id)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- 3. Audit Log Entry
    INSERT INTO public.admin_audit_logs (
        admin_id, 
        role, 
        action, 
        resource_type, 
        resource_id, 
        affected_user_id, 
        reason, 
        details
    ) VALUES (
        v_target_user_id, 
        'super_admin', 
        'PROMOTE_SUPER_ADMIN', 
        'USER', 
        v_target_user_id::text, 
        v_target_user_id, 
        'Initial system ownership configuration', 
        '{"method": "manual_migration", "verified_email": "samuelteodoro.ti@gmail.com"}'::jsonb
    );
END $$;

-- Security Definer helper for general admin checks
CREATE OR REPLACE FUNCTION public.has_any_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'support', 'analyst')
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_any_admin_role(uuid) TO authenticated, service_role;

-- Hardening roles access
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- Hardening profiles visibility for admins
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_any_admin_role(auth.uid()));
