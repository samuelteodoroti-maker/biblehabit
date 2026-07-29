CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_id uuid NOT NULL REFERENCES public.reading_logs(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('fire','amen')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_id, type)
);

GRANT SELECT, INSERT, DELETE ON public.reactions TO authenticated;
GRANT ALL ON public.reactions TO service_role;

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reactions"
  ON public.reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "View reactions on visible logs"
  ON public.reactions FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.reading_logs rl
      WHERE rl.id = reactions.log_id
        AND (
          rl.user_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.group_members gm1
            JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.user_id = auth.uid()
              AND gm2.user_id = rl.user_id
          )
        )
    )
  );

CREATE INDEX reactions_log_id_idx ON public.reactions(log_id);