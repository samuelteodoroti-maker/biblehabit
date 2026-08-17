-- 1. Estrutura de Tabelas
CREATE TABLE IF NOT EXISTS public.reading_passages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_log_id uuid NOT NULL REFERENCES public.reading_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id text NOT NULL, -- Código canônico (ex: 'GEN', 'MAT')
  start_chapter integer NOT NULL,
  start_verse integer,
  end_chapter integer,
  end_verse integer,
  is_full_chapter boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Alterações em reading_logs
-- Primeiro renomeia a coluna
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reading_logs' AND column_name='read_date') THEN
    ALTER TABLE public.reading_logs RENAME COLUMN read_date TO reading_date;
  END IF;
END $$;

ALTER TABLE public.reading_logs ADD COLUMN IF NOT EXISTS duration_minutes integer;
ALTER TABLE public.reading_logs ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Função para Recalcular Ofensiva (Streak)
CREATE OR REPLACE FUNCTION public.calculate_user_streak(_user_id uuid)
RETURNS TABLE(current_streak integer, longest_streak integer)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current_streak integer := 0;
  v_longest_streak integer := 0;
  v_last_date date;
  v_row record;
  v_today date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  -- Considera apenas datas únicas em ordem decrescente
  FOR v_row IN 
    SELECT DISTINCT reading_date 
    FROM public.reading_logs 
    WHERE user_id = _user_id 
    ORDER BY reading_date DESC
  LOOP
    IF v_last_date IS NULL THEN
      -- Se a leitura for de hoje ou ontem, começa o streak
      IF v_row.reading_date >= v_today - INTERVAL '1 day' THEN
        v_current_streak := 1;
        v_last_date := v_row.reading_date;
      ELSE
        v_current_streak := 0;
        -- Mesmo que o current streak esteja quebrado, precisamos continuar para achar o longest
        v_last_date := v_row.reading_date;
      END IF;
    ELSE
      -- Verifica se é o dia anterior ao último processado
      IF v_row.reading_date = v_last_date - INTERVAL '1 day' THEN
        IF v_current_streak > 0 THEN
          v_current_streak := v_current_streak + 1;
        END IF;
      ELSE
        -- Quebra de sequência para o current_streak (se já não estiver 0)
        v_current_streak := 0;
      END IF;
      v_last_date := v_row.reading_date;
    END IF;
  END LOOP;
  
  -- Cálculo robusto do Longest Streak
  WITH groups AS (
    SELECT 
      reading_date,
      reading_date - (row_number() OVER (ORDER BY reading_date))::int as grp
    FROM (SELECT DISTINCT reading_date FROM public.reading_logs WHERE user_id = _user_id) d
  ),
  counts AS (
    SELECT count(*) as streak_len
    FROM groups
    GROUP BY grp
  )
  SELECT COALESCE(MAX(streak_len), 0) INTO v_longest_streak FROM counts;

  RETURN QUERY SELECT COALESCE(v_current_streak, 0), COALESCE(v_longest_streak, 0);
END;
$$;

-- 4. Função para Sincronizar Perfil
CREATE OR REPLACE FUNCTION public.sync_profile_on_reading()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current integer;
  v_longest integer;
  v_total_chapters bigint;
  v_last_date date;
  v_user_id uuid;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_user_id := OLD.user_id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;

  SELECT current_streak, longest_streak INTO v_current, v_longest 
  FROM public.calculate_user_streak(v_user_id);
  
  SELECT SUM(chapters_count) INTO v_total_chapters 
  FROM public.reading_logs 
  WHERE user_id = v_user_id;

  SELECT MAX(reading_date) INTO v_last_date 
  FROM public.reading_logs 
  WHERE user_id = v_user_id;

  UPDATE public.profiles
  SET 
    current_streak = v_current,
    longest_streak = v_longest,
    total_chapters_read = COALESCE(v_total_chapters, 0),
    last_read_date = v_last_date,
    updated_at = now()
  WHERE id = v_user_id;

  IF (TG_OP = 'DELETE') THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

-- Remove triggers antigos
DROP TRIGGER IF EXISTS reading_logs_update_streak ON public.reading_logs;
DROP TRIGGER IF EXISTS reading_logs_sync_profile ON public.reading_logs;

CREATE TRIGGER reading_logs_sync_profile
AFTER INSERT OR UPDATE OR DELETE ON public.reading_logs
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_on_reading();

-- 5. Segurança
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_passages TO authenticated;
GRANT ALL ON public.reading_passages TO service_role;

CREATE POLICY "Users can manage own passages" ON public.reading_passages
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Group members can view co-member passages" ON public.reading_passages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = reading_passages.user_id
    )
  );

-- 6. Índices
CREATE INDEX IF NOT EXISTS idx_passages_log_id ON public.reading_passages(reading_log_id);
CREATE INDEX IF NOT EXISTS idx_passages_user_id ON public.reading_passages(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_reading_date ON public.reading_logs(reading_date);
