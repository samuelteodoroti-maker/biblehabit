
-- Hardening is_super_admin and check_super_admin_promotion
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.check_super_admin_promotion() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_super_admin_promotion() TO service_role;
