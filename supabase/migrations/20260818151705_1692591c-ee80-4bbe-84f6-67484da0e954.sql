
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_passages TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON public.reading_plans TO service_role;
GRANT ALL ON public.reading_logs TO service_role;
GRANT ALL ON public.reading_passages TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT ON public.profiles TO anon;
