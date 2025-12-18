-- Script para tornar vinicius01@gmail.com admin
-- Execute este script no SQL Editor do Supabase Dashboard

-- Opção 1: Se o usuário já existe, atualiza diretamente
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'vinicius01@gmail.com';

-- Opção 2: Verificar se o usuário existe primeiro
-- SELECT user_id, email, full_name, is_admin 
-- FROM public.profiles 
-- WHERE email = 'vinicius01@gmail.com';

-- Opção 3: Se quiser tornar admin mesmo que já exista outro admin (para adicionar mais admins)
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE email = 'vinicius01@gmail.com';

-- Verificar resultado
SELECT user_id, email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'vinicius01@gmail.com';


