-- ============================================
-- CRIAR TABELA USER_COURSE_ACCESS
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Passos:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Clique em "New Query"
-- 4. Cole o código abaixo
-- 5. Clique em "Run"

-- Criar tabela para controlar acesso de usuários a cursos bloqueados
CREATE TABLE IF NOT EXISTS public.user_course_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, course_id)
);

-- Habilitar RLS
ALTER TABLE public.user_course_access ENABLE ROW LEVEL SECURITY;

-- Políticas RLS usando a função is_user_admin() para evitar recursão
-- Se a função is_user_admin() não existir, use a versão alternativa abaixo
CREATE POLICY "Users can view their course access" ON public.user_course_access
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para admins
-- IMPORTANTE: Escolha UMA das duas versões abaixo baseado no seu banco

-- ===== VERSÃO 1: Se você TEM a função is_user_admin() =====
-- Descomente as linhas abaixo (remova o --) se a função is_user_admin() existir:
/*
CREATE POLICY "Admins can view all course access" ON public.user_course_access
  FOR SELECT USING (public.is_user_admin());

CREATE POLICY "Admins can insert course access" ON public.user_course_access
  FOR INSERT WITH CHECK (public.is_user_admin());

CREATE POLICY "Admins can update course access" ON public.user_course_access
  FOR UPDATE USING (public.is_user_admin());

CREATE POLICY "Admins can delete course access" ON public.user_course_access
  FOR DELETE USING (public.is_user_admin());
*/

-- ===== VERSÃO 2: Se você NÃO TEM a função is_user_admin() =====
-- Use esta versão se a função is_user_admin() não existir (versão padrão):
CREATE POLICY "Admins can view all course access" ON public.user_course_access
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage course access" ON public.user_course_access
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Verificar se a tabela foi criada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_course_access'
ORDER BY ordinal_position;

