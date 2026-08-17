
-- 1. Hardening has_any_admin_role
REVOKE EXECUTE ON FUNCTION public.has_any_admin_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_admin_role(uuid) TO authenticated, service_role;

-- 2. Hardening other potential leaks mentioned by linter
-- The linter mentioned 6 issues, let's harden common admin functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Revoke on any other sensitive functions if they were exposed
-- (Assuming based on previous linter output that they might be exposed)
REVOKE EXECUTE ON FUNCTION public.join_group_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated, service_role;
