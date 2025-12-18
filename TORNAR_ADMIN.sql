-- ============================================
-- SQL PARA TORNAR admin@gmail.com ADMINISTRADOR
-- ============================================
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- PASSO 1: Verificar se o usuário existe
SELECT user_id, email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'admin@gmail.com';

-- PASSO 2: Tornar admin
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'admin@gmail.com';

-- PASSO 3: Verificar se funcionou (deve mostrar is_admin = true)
SELECT user_id, email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'admin@gmail.com';

-- ============================================
-- IMPORTANTE:
-- ============================================
-- Se não retornar nenhuma linha, significa que o usuário ainda não criou a conta.
-- Nesse caso, você precisa:
-- 1. Criar a conta primeiro em http://localhost:8080/auth
-- OU
-- 2. Usar http://localhost:8080/setup para criar a conta admin diretamente
-- ============================================


