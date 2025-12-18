-- Adicionar coluna image_url na tabela courses_modules
ALTER TABLE public.courses_modules 
ADD COLUMN IF NOT EXISTS image_url TEXT;


