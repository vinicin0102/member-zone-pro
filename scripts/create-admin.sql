-- Script para tornar o primeiro usuário admin
-- Execute este script no SQL Editor do Supabase Dashboard

-- Opção 1: Tornar o primeiro usuário cadastrado admin
-- (Descomente a linha abaixo e substitua 'seu-email@exemplo.com' pelo email do usuário)
-- UPDATE public.profiles SET is_admin = true WHERE email = 'seu-email@exemplo.com';

-- Opção 2: Tornar todos os usuários existentes admin (útil para o primeiro setup)
-- UPDATE public.profiles SET is_admin = true;

-- Opção 3: Tornar um usuário específico admin pelo user_id
-- (Descomente e substitua o UUID pelo user_id do usuário)
-- UPDATE public.profiles SET is_admin = true WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Para verificar quais usuários existem:
-- SELECT user_id, email, full_name, is_admin FROM public.profiles;

-- Para verificar qual usuário está logado atualmente:
-- SELECT auth.uid() as current_user_id;



