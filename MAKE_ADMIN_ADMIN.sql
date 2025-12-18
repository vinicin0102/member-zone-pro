-- Script para tornar admin@gmail.com admin
-- Execute este script no SQL Editor do Supabase Dashboard

-- IMPORTANTE: Certifique-se de que o usuário admin@gmail.com já criou uma conta primeiro!

-- Tornar o usuário admin (UPDATE direto)
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'admin@gmail.com';

-- Verificar se funcionou
SELECT user_id, email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'admin@gmail.com';

-- Se não retornar nenhuma linha, significa que o usuário ainda não criou a conta.
-- Nesse caso, você precisa criar a conta primeiro em http://localhost:8080/auth


