# Instruções para Configurar o Banco de Dados

## Passo 1: Executar o Setup do Banco

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Abra o arquivo `SETUP_DATABASE.sql` ou copie o conteúdo
5. Cole e execute todo o script

Isso criará todas as tabelas necessárias:
- `courses_modules` - Módulos do curso
- `courses_lessons` - Aulas
- `user_lessons_progress` - Progresso dos usuários
- `user_access` - Controle de acesso premium
- `profiles` - Perfis dos usuários (com campo is_admin)

## Passo 2: Tornar vinicius01@gmail.com Admin

Depois de executar o setup, execute este SQL:

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'vinicius01@gmail.com';
```

**IMPORTANTE:** O usuário precisa ter criado uma conta primeiro!

## Passo 3: Verificar se funcionou

Execute este SQL para verificar:

```sql
SELECT user_id, email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'vinicius01@gmail.com';
```

Você deve ver `is_admin: true` no resultado.

## Passo 4: Fazer Login

1. Acesse: http://localhost:8080/auth
2. Faça login com `vinicius01@gmail.com`
3. Você verá o botão "Admin" na área de membros
4. Acesse `/admin` para gerenciar módulos e aulas


