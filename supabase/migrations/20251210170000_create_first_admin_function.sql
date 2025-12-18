-- Função para tornar o primeiro usuário admin
-- Esta função verifica se existe algum admin, se não existir, torna o primeiro usuário admin

CREATE OR REPLACE FUNCTION public.make_first_user_admin(target_email TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
  target_user_id UUID;
  result_message TEXT;
BEGIN
  -- Verifica se já existe algum admin
  SELECT COUNT(*) INTO admin_count
  FROM public.profiles
  WHERE is_admin = true;

  -- Se já existe admin, retorna mensagem
  IF admin_count > 0 THEN
    RETURN 'Já existe um administrador no sistema. Use UPDATE diretamente para adicionar mais admins.';
  END IF;

  -- Se foi fornecido um email específico
  IF target_email IS NOT NULL THEN
    -- Busca o user_id pelo email
    SELECT user_id INTO target_user_id
    FROM public.profiles
    WHERE email = target_email
    LIMIT 1;

    IF target_user_id IS NULL THEN
      RETURN 'Usuário com email ' || target_email || ' não encontrado.';
    END IF;
  ELSE
    -- Pega o primeiro usuário cadastrado
    SELECT user_id INTO target_user_id
    FROM public.profiles
    ORDER BY created_at ASC
    LIMIT 1;

    IF target_user_id IS NULL THEN
      RETURN 'Nenhum usuário encontrado no sistema.';
    END IF;
  END IF;

  -- Torna o usuário admin
  UPDATE public.profiles
  SET is_admin = true
  WHERE user_id = target_user_id;

  SELECT email INTO result_message
  FROM public.profiles
  WHERE user_id = target_user_id;

  RETURN 'Usuário ' || COALESCE(result_message, target_user_id::TEXT) || ' agora é administrador!';
END;
$$;

-- Para usar a função:
-- SELECT public.make_first_user_admin(); -- torna o primeiro usuário admin
-- SELECT public.make_first_user_admin('seu-email@exemplo.com'); -- torna um email específico admin



