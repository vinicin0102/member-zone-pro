-- ============================================
-- CORRIGIR TODAS AS POLÍTICAS RLS COM RECURSÃO
-- ============================================
-- Execute este SQL completo no Supabase SQL Editor

-- 1. Criar função helper para verificar admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Usa busca direta sem depender de outras políticas
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = user_id_param 
    AND profiles.is_admin = true
    LIMIT 1
  );
END;
$$;

-- 2. Remover todas as políticas problemáticas de profiles
DROP POLICY IF EXISTS "Users can view their profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 3. Recriar políticas de profiles (sem recursão)
CREATE POLICY "Users can view their profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Para admins verem todos, usar função SECURITY DEFINER
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.is_user_admin()
  );

-- 4. Atualizar políticas de courses_modules (usar função helper)
DROP POLICY IF EXISTS "Admins can insert modules" ON public.courses_modules;
DROP POLICY IF EXISTS "Admins can update modules" ON public.courses_modules;
DROP POLICY IF EXISTS "Admins can delete modules" ON public.courses_modules;

CREATE POLICY "Admins can insert modules" ON public.courses_modules
  FOR INSERT WITH CHECK (public.is_user_admin());

CREATE POLICY "Admins can update modules" ON public.courses_modules
  FOR UPDATE USING (public.is_user_admin());

CREATE POLICY "Admins can delete modules" ON public.courses_modules
  FOR DELETE USING (public.is_user_admin());

-- 5. Atualizar políticas de courses_lessons
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.courses_lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.courses_lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.courses_lessons;

CREATE POLICY "Admins can insert lessons" ON public.courses_lessons
  FOR INSERT WITH CHECK (public.is_user_admin());

CREATE POLICY "Admins can update lessons" ON public.courses_lessons
  FOR UPDATE USING (public.is_user_admin());

CREATE POLICY "Admins can delete lessons" ON public.courses_lessons
  FOR DELETE USING (public.is_user_admin());

-- 6. Atualizar políticas de user_access
DROP POLICY IF EXISTS "Admins can view all access" ON public.user_access;
DROP POLICY IF EXISTS "Admins can manage access" ON public.user_access;

CREATE POLICY "Admins can view all access" ON public.user_access
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.is_user_admin()
  );

CREATE POLICY "Admins can manage access" ON public.user_access
  FOR ALL USING (
    auth.uid() = user_id OR 
    public.is_user_admin()
  );

-- 7. Atualizar políticas de site_settings (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_settings') THEN
    DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
    CREATE POLICY "Admins can manage settings" ON public.site_settings
      FOR ALL USING (public.is_user_admin());
  END IF;
END $$;

-- ============================================
-- TESTE
-- ============================================
-- Verifique se funcionou:
-- SELECT public.is_user_admin();
-- SELECT * FROM public.profiles LIMIT 1;


