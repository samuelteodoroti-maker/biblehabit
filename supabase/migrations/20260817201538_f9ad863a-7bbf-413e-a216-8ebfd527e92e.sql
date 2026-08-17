
-- Fix search_path and execution permissions for all security definer functions

-- 1. update_streak_on_log
ALTER FUNCTION public.update_streak_on_log() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.update_streak_on_log() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_streak_on_log() TO service_role;

-- 2. handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 3. join_group_by_code
ALTER FUNCTION public.join_group_by_code(text) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.join_group_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated, service_role;

-- 4. is_group_member
ALTER FUNCTION public.is_group_member(uuid, uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated, service_role;

-- 5. calculate_user_streak
ALTER FUNCTION public.calculate_user_streak(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.calculate_user_streak(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(uuid) TO authenticated, service_role;

-- 6. sync_profile_on_reading
ALTER FUNCTION public.sync_profile_on_reading() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.sync_profile_on_reading() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_profile_on_reading() TO service_role;

-- 7. has_role (already handled in previous migration, but ensuring settings)
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
