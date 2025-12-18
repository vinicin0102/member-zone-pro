# Como Criar o Primeiro Administrador

## Opção 1: Via Interface Web (Recomendado)

1. Acesse: `http://localhost:8080/setup`
2. Faça login com sua conta (ou crie uma conta primeiro)
3. Clique em "Tornar-me Administrador"

## Opção 2: Via SQL Editor do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute uma das opções abaixo:

### Tornar o primeiro usuário admin:
```sql
SELECT public.make_first_user_admin();
```

### Tornar um usuário específico admin (pelo email):
```sql
SELECT public.make_first_user_admin('seu-email@exemplo.com');
```

### Ou atualize diretamente:
```sql
-- Ver usuários existentes
SELECT user_id, email, full_name, is_admin FROM public.profiles;

-- Tornar um usuário específico admin
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'seu-email@exemplo.com';
```

## Opção 3: Executar a Migração

Se você ainda não executou a migração que cria a função, execute o arquivo:
`supabase/migrations/20251210170000_create_first_admin_function.sql`

no SQL Editor do Supabase.

