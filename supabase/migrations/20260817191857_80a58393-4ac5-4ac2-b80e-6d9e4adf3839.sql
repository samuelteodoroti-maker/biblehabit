
-- 1. Enum para Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Tabela user_roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- 3. Grants
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 4. RLS na user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Função has_role (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      and role = _role
  )
$$;

-- 6. Tabela app_updates
CREATE TYPE public.update_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

CREATE TABLE public.app_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version text NOT NULL UNIQUE,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    summary text NOT NULL,
    content text,
    categories text[] DEFAULT '{}',
    highlights text[] DEFAULT '{}',
    improvements text[] DEFAULT '{}',
    fixes text[] DEFAULT '{}',
    accessibility_changes text[] DEFAULT '{}',
    published_at timestamptz,
    status update_status NOT NULL DEFAULT 'draft',
    cover_image_url text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Grants app_updates
GRANT SELECT ON public.app_updates TO anon, authenticated;
GRANT ALL ON public.app_updates TO service_role;

-- RLS app_updates
ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

-- Políticas app_updates
CREATE POLICY "Public can view published updates"
ON public.app_updates FOR SELECT
TO anon, authenticated
USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

CREATE POLICY "Admins can do everything on app_updates"
ON public.app_updates
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.app_updates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Inserir usuário atual como admin (precisamos do ID, faremos em seguida)
