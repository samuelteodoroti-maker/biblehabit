-- Revoke public execute
REVOKE EXECUTE ON FUNCTION public.calculate_user_streak(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_profile_on_reading() FROM PUBLIC;

-- Set search_path
ALTER FUNCTION public.calculate_user_streak(uuid) SET search_path = public;
ALTER FUNCTION public.sync_profile_on_reading() SET search_path = public;

-- Explicit grants
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_profile_on_reading() TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_profile_on_reading() TO service_role;
