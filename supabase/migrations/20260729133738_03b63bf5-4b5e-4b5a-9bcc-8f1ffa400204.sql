-- ============ PROFILES: fechar leitura ============
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Group co-members can view profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
        AND gm2.user_id = profiles.id
    )
  );

-- View pública para rankings/leaderboards (sem email nem last_read_date)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT
  id,
  name,
  avatar_url,
  total_chapters_read,
  current_streak,
  longest_streak
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;

-- ============ GROUPS: esconder invite_code de terceiros ============
DROP POLICY IF EXISTS "Groups visible to authenticated users" ON public.groups;

CREATE POLICY "Members and creator can view group"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

-- RPC para entrar via código sem precisar ler a tabela groups
CREATE OR REPLACE FUNCTION public.join_group_by_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_group_id
  FROM public.groups
  WHERE invite_code = _code
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  INSERT INTO public.group_members (group_id, user_id)
  VALUES (v_group_id, auth.uid())
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN v_group_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_group_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;