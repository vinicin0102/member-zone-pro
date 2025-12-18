# Como Corrigir o Erro "Could not find the 'is_locked' column"

## Problema
O erro ocorre porque a coluna `is_locked` não existe na tabela `courses` no banco de dados.

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
   -- Adicionar campo is_locked na tabela courses
   ALTER TABLE public.courses 
   ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;
   ```

4. **Clique em "Run"** (ou pressione Ctrl+Enter)

5. **Verifique se funcionou:**
   - Você deve ver uma mensagem de sucesso
   - Recarregue a página do painel admin
   - O botão de bloquear curso deve funcionar

### Opção 2: Usar a Migration Local (Se usar Supabase CLI)

Se você está usando o Supabase CLI localmente, execute:

```bash
# Aplicar a migration
supabase db push
```

A migration está em: `supabase/migrations/20251210210000_add_course_is_locked.sql`

## Verificação

Depois de executar o SQL, você pode verificar se a coluna foi criada:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'courses'
  AND column_name = 'is_locked';
```

Isso deve retornar:
- column_name: `is_locked`
- data_type: `boolean`
- is_nullable: `NO`
- column_default: `false`

## Próximos Passos

Após adicionar a coluna:
1. Recarregue a página do painel admin
2. Teste o botão de bloqueio em um curso
3. O curso bloqueado deve aparecer com o badge "🔒 Bloqueado"
4. Na área de membros, os módulos do curso bloqueado aparecerão em escala de cinza


