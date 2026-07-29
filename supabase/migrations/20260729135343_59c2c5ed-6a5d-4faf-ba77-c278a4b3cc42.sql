ALTER TABLE public.reading_plans
  ADD COLUMN IF NOT EXISTS start_book text,
  ADD COLUMN IF NOT EXISTS end_book text,
  ADD COLUMN IF NOT EXISTS total_days integer;

UPDATE public.reading_plans SET total_days = goal_days WHERE total_days IS NULL;