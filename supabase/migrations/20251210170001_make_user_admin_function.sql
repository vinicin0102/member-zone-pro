-- Função para tornar qualquer usuário admin (pode ser usada mesmo se já existir admin)

CREATE OR REPLACE FUNCTION public.make_user_admin(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  result_message TEXT;
BEGIN
  -- Busca o user_id pelo email
  SELECT user_id INTO target_user_id
  FROM public.profiles
  WHERE email = target_email
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RETURN 'Usuário com email ' || target_email || ' não encontrado. Certifique-se de que o usuário já criou uma conta.';
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
-- SELECT public.make_user_admin('vinicius01@gmail.com');


