ALTER TABLE public.reading_logs DROP CONSTRAINT IF EXISTS reading_logs_user_id_read_date_key;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_passages TO authenticated;