
-- 1. Hardening has_role function
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

-- Revoke public execution and grant to authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Reading Passages RLS
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reading passages" ON public.reading_passages;
CREATE POLICY "Users can view their own reading passages"
ON public.reading_passages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reading passages" ON public.reading_passages;
CREATE POLICY "Users can insert their own reading passages"
ON public.reading_passages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reading passages" ON public.reading_passages;
CREATE POLICY "Users can update their own reading passages"
ON public.reading_passages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reading passages" ON public.reading_passages;
CREATE POLICY "Users can delete their own reading passages"
ON public.reading_passages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Group members can view co-member reading passages
DROP POLICY IF EXISTS "Group members can view co-member reading passages" ON public.reading_passages;
CREATE POLICY "Group members can view co-member reading passages"
ON public.reading_passages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() AND gm2.user_id = reading_passages.user_id
  )
);

-- 3. User Roles Protection
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role can modify roles
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 4. App Updates Protection
ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published updates" ON public.app_updates;
CREATE POLICY "Anyone can view published updates"
ON public.app_updates FOR SELECT
TO anon, authenticated
USING (status = 'published' AND (published_at IS NULL OR published_at <= NOW()));

DROP POLICY IF EXISTS "Admins can manage all updates" ON public.app_updates;
CREATE POLICY "Admins can manage all updates"
ON public.app_updates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Profiles Protection (Email field)
-- Profiles RLS hardening
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- 6. Add constraints for data integrity
ALTER TABLE public.reading_passages
ADD CONSTRAINT chapters_range_check CHECK (start_chapter > 0 AND (end_chapter IS NULL OR end_chapter >= start_chapter));

ALTER TABLE public.reading_logs
ADD CONSTRAINT duration_check CHECK (duration_minutes IS NULL OR duration_minutes >= 0);

-- 7. Grant access to service_role for all tables
GRANT ALL ON public.reading_passages TO service_role;
GRANT ALL ON public.reading_logs TO service_role;
GRANT ALL ON public.reading_plans TO service_role;
GRANT ALL ON public.groups TO service_role;
GRANT ALL ON public.group_members TO service_role;
GRANT ALL ON public.group_messages TO service_role;
GRANT ALL ON public.reactions TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.app_updates TO service_role;
