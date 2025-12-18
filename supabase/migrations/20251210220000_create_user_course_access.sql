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
CREATE POLICY "Users can view their course access" ON public.user_course_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all course access" ON public.user_course_access
  FOR SELECT USING (public.is_user_admin());

CREATE POLICY "Admins can insert course access" ON public.user_course_access
  FOR INSERT WITH CHECK (public.is_user_admin());

CREATE POLICY "Admins can update course access" ON public.user_course_access
  FOR UPDATE USING (public.is_user_admin());

CREATE POLICY "Admins can delete course access" ON public.user_course_access
  FOR DELETE USING (public.is_user_admin());


