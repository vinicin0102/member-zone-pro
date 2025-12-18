# Como Corrigir o Erro "Could not find the table 'public.user_course_access'"

## Problema
O erro ocorre porque a tabela `user_course_access` não existe no banco de dados. Esta tabela é necessária para gerenciar o acesso de usuários específicos a cursos bloqueados.

## Solução Rápida

### Opção 1: Executar SQL diretamente no Supabase (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Cole e execute o seguinte SQL:**

```sql
-- Criar tabela para controlar acesso de usuários a cursos bloqueados
CREATE TABLE IF NOT EXISTS public.user_course_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, course_id)
);

-- Habilitar RLS
ALTER TABLE public.user_course_access ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their course access" ON public.user_course_access
  FOR SELECT USING (auth.uid() = user_id);

-- Verificar se a função is_user_admin() existe
-- Se existir, usar políticas mais seguras:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'is_user_admin'
  ) THEN
    EXECUTE '
      CREATE POLICY "Admins can view all course access" ON public.user_course_access
        FOR SELECT USING (public.is_user_admin());
      
      CREATE POLICY "Admins can insert course access" ON public.user_course_access
        FOR INSERT WITH CHECK (public.is_user_admin());
      
      CREATE POLICY "Admins can update course access" ON public.user_course_access
        FOR UPDATE USING (public.is_user_admin());
      
      CREATE POLICY "Admins can delete course access" ON public.user_course_access
        FOR DELETE USING (public.is_user_admin());
    ';
  ELSE
    -- Versão alternativa sem is_user_admin()
    CREATE POLICY "Admins can view all course access" ON public.user_course_access
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
      );

    CREATE POLICY "Admins can manage course access" ON public.user_course_access
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
      );
  END IF;
END $$;
```

4. **Clique em "Run"** (ou pressione Ctrl+Enter)

5. **Verifique se funcionou:**
   - Você deve ver uma mensagem de sucesso
   - Recarregue a página do painel admin
   - Ao clicar em um usuário na aba "Usuários", os cursos bloqueados devem aparecer
   - Os switches para liberar acesso devem funcionar

### Opção 2: Usar a Migration Local (Se usar Supabase CLI)

Se você está usando o Supabase CLI localmente, execute:

```bash
# Aplicar a migration
supabase db push
```

A migration está em: `supabase/migrations/20251210220000_create_user_course_access.sql`

## Verificação

Depois de executar o SQL, você pode verificar se a tabela foi criada:

```sql
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_course_access'
ORDER BY ordinal_position;
```

Isso deve retornar:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key para auth.users)
- `course_id` (uuid, foreign key para public.courses)
- `granted_at` (timestamp with time zone)
- `granted_by` (uuid, nullable, foreign key para auth.users)

## Como Funciona

1. **Bloqueio de Curso:**
   - Na aba "Cursos", ative o switch "Bloquear" em um curso
   - O curso fica bloqueado para todos os usuários

2. **Liberar Acesso:**
   - Na aba "Usuários", clique em um usuário para expandir
   - Os cursos bloqueados aparecerão abaixo
   - Ative o switch ao lado do curso para liberar acesso para aquele usuário específico

3. **Na Área de Membros:**
   - Cursos bloqueados aparecem em escala de cinza (grayscale)
   - Usuários sem acesso não conseguem acessar os módulos
   - Usuários com acesso liberado veem o curso normalmente e podem acessar

## Próximos Passos

Após criar a tabela:
1. Recarregue a página do painel admin
2. Vá na aba "Usuários"
3. Clique em um usuário para expandir
4. Os cursos bloqueados devem aparecer
5. Teste ativando/desativando os switches de acesso


