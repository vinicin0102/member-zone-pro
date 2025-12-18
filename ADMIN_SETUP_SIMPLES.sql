-- SQL SIMPLES - Execute no Supabase SQL Editor

-- Tornar admin@gmail.com admin
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'admin@gmail.com';

-- Verificar
SELECT email, is_admin FROM public.profiles WHERE email = 'admin@gmail.com';
