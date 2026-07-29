
-- Security definer helper to check membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated;

-- Rebuild group_members policies without self-referential subqueries
DROP POLICY IF EXISTS "Members can view their groups memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups as themselves" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave (delete their own membership)" ON public.group_members;

CREATE POLICY "View own memberships"
ON public.group_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "View co-members via function"
ON public.group_members
FOR SELECT
TO authenticated
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Insert self membership"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete own membership"
ON public.group_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Rebuild groups SELECT policy to use the helper (avoids referencing group_members from a policy that could recurse)
DROP POLICY IF EXISTS "Members and creator can view group" ON public.groups;

CREATE POLICY "Members and creator can view group"
ON public.groups
FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR public.is_group_member(id, auth.uid()));
