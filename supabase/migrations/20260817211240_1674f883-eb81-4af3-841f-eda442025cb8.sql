
-- 1. Ensure only service_role can execute the promotion check trigger
REVOKE ALL ON FUNCTION public.check_super_admin_promotion() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_super_admin_promotion() TO service_role;

-- 2. Ensure only super_admin can execute the sensitive management functions
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- 3. Restrict audit logs to super_admin and admin only
GRANT SELECT ON public.admin_audit_logs TO authenticated;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
TO authenticated
USING (public.has_any_admin_role(auth.uid()));

-- Only service_role can insert into audit logs manually (usually handled by triggers or RPCs)
GRANT INSERT ON public.admin_audit_logs TO service_role;
REVOKE INSERT ON public.admin_audit_logs FROM authenticated;
