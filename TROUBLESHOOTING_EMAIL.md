# Solução de Problemas - Erro de Email Inválido

## Problema
O Supabase está rejeitando emails válidos como "admin@gmail.com" com a mensagem:
"Email address 'admin@gmail.com' is invalid"

## Possíveis Causas

1. **Configuração de Email no Supabase Dashboard**
   - O Supabase pode ter restrições configuradas
   - Verifique em: Authentication → Settings → Email Auth

2. **Bloqueio de Domínios**
   - Pode haver uma lista de domínios bloqueados
   - Verifique em: Authentication → Settings

3. **Validação de Email Muito Restritiva**
   - O Supabase pode ter validação customizada

## Soluções

### Opção 1: Usar Email Diferente (Mais Rápido)
Tente criar conta com:
- `admin@exemplo.com`
- `admin@teste.com`
- `seuemail@outlook.com`
- `seuemail@hotmail.com`

### Opção 2: Verificar Configurações do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Authentication** → **Settings**
4. Verifique:
   - **Enable email signup** deve estar habilitado
   - **Email template** não deve ter restrições
   - **Rate limits** não deve estar muito restritivo

### Opção 3: Verificar no Dashboard

1. Vá em: **Authentication** → **Policies**
2. Verifique se não há políticas bloqueando signups

### Opção 4: Criar Admin Via SQL (Alternativa)

Se não conseguir criar conta, você pode criar diretamente no Supabase:

1. Acesse o SQL Editor no Supabase Dashboard
2. Execute:

```sql
-- Primeiro, crie o usuário via Auth API ou Dashboard
-- Depois, torne-o admin:

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'seu-email@exemplo.com';
```

### Opção 5: Verificar Console do Navegador

1. Abra o Console (F12 ou Cmd+Option+I)
2. Tente criar a conta
3. Veja os erros detalhados no console
4. Procure por mensagens do Supabase

## Contato com Suporte Supabase

Se o problema persistir, pode ser um problema no lado do Supabase. Verifique:
- Status do serviço: https://status.supabase.com
- Documentação: https://supabase.com/docs/guides/auth



