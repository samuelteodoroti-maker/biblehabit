-- Fix search path for internal triggers
ALTER FUNCTION public.validate_support_session_status() SET search_path = public;
ALTER FUNCTION public.validate_profile_status() SET search_path = public;

-- Revoke execute from PUBLIC (this includes anon and authenticated)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_any_admin_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_support_session_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_profile_status() FROM PUBLIC;

-- Grant to service_role (always needed for internal functions/RPCs called by server)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_any_admin_role(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_support_session_status() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_profile_status() TO service_role;

-- Authenticated users need to be able to call role checks for their own RLS policies to work
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_admin_role(uuid) TO authenticated;
