-- Script para tornar vinicius01@gmail.com admin
-- Execute este script no SQL Editor do Supabase Dashboard

-- IMPORTANTE: Certifique-se de que o usuário já criou uma conta antes de executar este script!

-- Tornar o usuário admin (UPDATE direto)
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'vinicius01@gmail.com';

-- Verificar se funcionou
SELECT user_id, email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'vinicius01@gmail.com';

