
REVOKE EXECUTE ON FUNCTION public.update_streak_on_log() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.join_group_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;
