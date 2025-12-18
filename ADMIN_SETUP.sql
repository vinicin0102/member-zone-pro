-- ============================================
-- SCRIPT COMPLETO PARA TORNAR admin@gmail.com ADMIN
-- ============================================
-- Copie e cole no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard -> Seu Projeto -> SQL Editor

-- ============================================
-- PASSO 1: Verificar se o usuário existe
-- ============================================
SELECT 
  user_id, 
  email, 
  full_name, 
  is_admin 
FROM public.profiles 
WHERE email = 'admin@gmail.com';

-- ============================================
-- PASSO 2: Tornar o usuário ADMIN
-- ============================================
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'admin@gmail.com';

-- ============================================
-- PASSO 3: Verificar se funcionou
-- ============================================
-- Execute novamente para confirmar que is_admin = true
SELECT 
  user_id, 
  email, 
  full_name, 
  is_admin 
FROM public.profiles 
WHERE email = 'admin@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- user_id | email            | full_name | is_admin
-- --------|------------------|-----------|----------
-- xxx...  | admin@gmail.com  | Nome      | true
-- ============================================

-- ============================================
-- SE O USUÁRIO NÃO EXISTIR:
-- ============================================
-- 1. Acesse: http://localhost:8080/setup
-- 2. Preencha o formulário com admin@gmail.com
-- 3. Clique em "Criar Conta de Administrador"
-- 4. Depois execute este SQL novamente
-- ============================================

-- ============================================
-- APÓS EXECUTAR:
-- ============================================
-- 1. Faça LOGOUT da aplicação
-- 2. Faça LOGIN novamente com admin@gmail.com
-- 3. Acesse: http://localhost:8080/members
-- 4. Você verá o botão "Admin" no topo
-- 5. Clique no botão "Admin" para acessar o painel
-- ============================================


