
-- Bible Habit Security Hardening: Super Admin Role Management
-- Ensure only super_admin can modify the user_roles table

-- 1. Create a function to check for super_admin role (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
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
      AND role = 'super_admin'
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- 2. Restrict INSERT, UPDATE, DELETE on user_roles to super_admin ONLY (or service_role)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only super_admin can modify roles" ON public.user_roles;
CREATE POLICY "Only super_admin can modify roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- 3. Audit log trigger to prevent promoting others to super_admin unless manually done
-- (The migration already removed others, this is for future protection)
CREATE OR REPLACE FUNCTION public.check_super_admin_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If trying to set a new role as super_admin
  IF NEW.role = 'super_admin' THEN
    -- Check if it's the specific owner UUID
    IF NEW.user_id != '5cf509ab-98fb-4816-a3f8-39faf22b4864' THEN
      RAISE EXCEPTION 'Only the designated owner can be super_admin. This action is blocked and logged.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_super_admin_promotion ON public.user_roles;
CREATE TRIGGER tr_check_super_admin_promotion
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.check_super_admin_promotion();
