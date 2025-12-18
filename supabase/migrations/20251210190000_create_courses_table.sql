-- Criar tabela de cursos (nível superior)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar course_id na tabela courses_modules (se não existir)
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

-- Habilitar RLS na tabela courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para courses
CREATE POLICY "Anyone can view courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert courses" ON public.courses
  FOR INSERT WITH CHECK (public.is_user_admin());

CREATE POLICY "Admins can update courses" ON public.courses
  FOR UPDATE USING (public.is_user_admin());

CREATE POLICY "Admins can delete courses" ON public.courses
  FOR DELETE USING (public.is_user_admin());

-- Trigger para updated_at em courses
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


