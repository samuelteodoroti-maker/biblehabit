
ALTER TABLE public.reading_logs ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_messages TO authenticated;
GRANT ALL ON public.group_messages TO service_role;

ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view messages"
  ON public.group_messages FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can send messages"
  ON public.group_messages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_group_member(group_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Authors can delete their messages"
  ON public.group_messages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS group_messages_group_id_created_at_idx
  ON public.group_messages (group_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

-- Allow group members to see each other's reading_logs for the activity feed
CREATE POLICY "Group members can view co-member reading logs"
  ON public.reading_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
        AND gm2.user_id = reading_logs.user_id
    )
  );
