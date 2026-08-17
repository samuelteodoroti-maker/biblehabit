
-- Fix search_path for handle_updated_at
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Verify and ensure permissions for authenticated users on necessary business logic functions
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
