-- ============================================
-- CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS
-- ============================================
-- Execute este SQL no Supabase SQL Editor para corrigir o erro de recursão

-- 1. Remover políticas problemáticas da tabela profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Criar política sem recursão usando função SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_id_param AND is_admin = true
  );
END;
$$;

-- 3. Recriar política para admins verem todos os perfis (sem recursão)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.is_user_admin(auth.uid())
  );

-- 4. Permitir que usuários vejam seu próprio perfil (já existe, mas garantindo)
DROP POLICY IF EXISTS "Users can view their profile" ON public.profiles;
CREATE POLICY "Users can view their profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Permitir que usuários atualizem seu próprio perfil (já existe, mas garantindo)
DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
CREATE POLICY "Users can update their profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- VERIFICAR SE FUNCIONOU
-- ============================================
-- Execute para testar:
-- SELECT * FROM public.profiles WHERE email = 'admin@gmail.com';


