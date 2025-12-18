-- ============================================
-- ADICIONAR COLUNA IMAGE_URL EM COURSES_MODULES
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- Adicionar coluna image_url na tabela courses_modules
ALTER TABLE public.courses_modules 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verificar se foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses_modules' 
AND column_name = 'image_url';


