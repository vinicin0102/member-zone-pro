-- ============================================
-- RECRIAR POLÍTICAS DO BUCKET BANNERS
-- ============================================
-- Execute este SQL se as políticas não funcionarem
-- Ou se precisar recriar do zero

-- Remover todas as políticas antigas
DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

-- 1. Política de LEITURA PÚBLICA (qualquer um pode ver as imagens)
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- 2. Política de UPLOAD (apenas admins podem fazer upload)
CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  )
);

-- 3. Política de ATUALIZAÇÃO (apenas admins podem atualizar)
CREATE POLICY "Admins can update banner images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  )
);

-- 4. Política de DELEÇÃO (apenas admins podem deletar)
CREATE POLICY "Admins can delete banner images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  )
);

-- ============================================
-- VERIFICAÇÃO (opcional - para confirmar)
-- ============================================
-- Execute este SELECT para ver se as políticas foram criadas:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%Banner%';

-- ============================================
-- IMPORTANTE:
-- ============================================
-- 1. O bucket "banners" DEVE existir no Storage
-- 2. O bucket DEVE estar marcado como PÚBLICO
-- 3. Você DEVE estar logado como ADMIN
-- ============================================


