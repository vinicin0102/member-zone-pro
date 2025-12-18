-- ============================================
-- CRIAR BUCKET DE STORAGE PARA BANNERS
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- IMPORTANTE: Primeiro crie o bucket manualmente no Dashboard!
-- Storage → New bucket → Nome: "banners" → Public bucket: ON

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

-- Política para permitir leitura pública
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Política para admins fazerem upload
-- Usar função helper se existir, senão verificação direta
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_user_admin') THEN
    -- Usar função helper
    EXECUTE 'CREATE POLICY "Admins can upload banner images"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = ''banners'' AND
        public.is_user_admin()
      )';
    
    EXECUTE 'CREATE POLICY "Admins can update banner images"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = ''banners'' AND
        public.is_user_admin()
      )';
    
    EXECUTE 'CREATE POLICY "Admins can delete banner images"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = ''banners'' AND
        public.is_user_admin()
      )';
  ELSE
    -- Verificação direta
    CREATE POLICY "Admins can upload banner images"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'banners' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Admins can update banner images"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'banners' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Admins can delete banner images"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'banners' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;

-- ============================================
-- IMPORTANTE:
-- ============================================
-- 1. Vá no Supabase Dashboard: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Vá em "Storage" no menu lateral
-- 4. Clique em "New bucket"
-- 5. Nome: "banners"
-- 6. Marque "Public bucket" (importante!)
-- 7. Clique em "Create bucket"
-- 8. Depois execute este SQL para configurar as políticas
-- ============================================

