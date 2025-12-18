-- Adicionar coluna is_locked na tabela courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;


