GRANT SELECT ON public.user_roles TO authenticated;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles'
    ) THEN
        CREATE POLICY "Users can view their own roles" 
        ON public.user_roles FOR SELECT 
        TO authenticated 
        USING (auth.uid() = user_id);
    END IF;
END $$;