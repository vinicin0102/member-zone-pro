-- Script SIMPLES para tornar vinicius01@gmail.com admin
-- Execute apenas este SQL no Supabase Dashboard

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'vinicius01@gmail.com';

-- Depois execute este para verificar:
SELECT user_id, email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'vinicius01@gmail.com';


