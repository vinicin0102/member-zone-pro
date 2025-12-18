-- ============================================
-- CRIAR ESTRUTURA COMPLETA DE CURSOS
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar tabela de cursos (nível superior)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Adicionar course_id na tabela courses_modules (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'courses_modules' 
    AND column_name = 'course_id'
  ) THEN
    ALTER TABLE public.courses_modules 
    ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Habilitar RLS na tabela courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para courses
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Anyone can view courses" ON public.courses
  FOR SELECT USING (true);

-- Usar função helper se existir, senão usar verificação direta
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_user_admin') THEN
    DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
    CREATE POLICY "Admins can insert courses" ON public.courses
      FOR INSERT WITH CHECK (public.is_user_admin());

    DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
    CREATE POLICY "Admins can update courses" ON public.courses
      FOR UPDATE USING (public.is_user_admin());

    DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
    CREATE POLICY "Admins can delete courses" ON public.courses
      FOR DELETE USING (public.is_user_admin());
  ELSE
    DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
    CREATE POLICY "Admins can insert courses" ON public.courses
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
      );

    DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
    CREATE POLICY "Admins can update courses" ON public.courses
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
      );

    DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
    CREATE POLICY "Admins can delete courses" ON public.courses
      FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;

-- 5. Trigger para updated_at em courses (se a função existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
    CREATE TRIGGER update_courses_updated_at
      BEFORE UPDATE ON public.courses
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- NOTA: Após executar, você precisará:
-- 1. Migrar módulos existentes para um curso padrão (se houver)
-- 2. Atualizar o código do Admin para gerenciar cursos
-- ============================================


