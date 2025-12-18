-- ============================================
-- ADICIONAR CAMPO IS_LOCKED EM COURSES
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Passos:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Clique em "New Query"
-- 4. Cole o código abaixo
-- 5. Clique em "Run"

-- Adicionar campo is_locked na tabela courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'courses'
  AND column_name = 'is_locked';

