-- Adicionar campos de oferta na tabela courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS offer_video_url TEXT,
ADD COLUMN IF NOT EXISTS purchase_url TEXT;


