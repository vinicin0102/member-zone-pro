-- ============================================
-- MIGRAÇÃO: Criar Tabela de Configurações
-- ============================================
-- Execute este SQL no Supabase SQL Editor ANTES de usar as funcionalidades
-- de Banner, Personalizar e Configurações

-- Tabela para configurações do site (banner, personalização, etc)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para site_settings
DROP POLICY IF EXISTS "Anyone can view settings" ON public.site_settings;
CREATE POLICY "Anyone can view settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Inserir configurações padrão
INSERT INTO public.site_settings (key, value) VALUES
  ('banner_image_url', NULL),
  ('banner_text', 'método sociedade'),
  ('banner_redirect_url', NULL),
  ('platform_name', 'método sociedade'),
  ('logo_url', NULL),
  ('primary_color', '#8b5cf6'),
  ('theme', 'dark'),
  ('support_email', NULL),
  ('terms_url', NULL),
  ('privacy_url', NULL)
ON CONFLICT (key) DO NOTHING;

-- Trigger para atualizar updated_at (se a função já existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
    CREATE TRIGGER update_site_settings_updated_at
      BEFORE UPDATE ON public.site_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


