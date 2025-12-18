# 🔧 Corrigir Aba Personalizar

## ⚠️ Se as opções não estão funcionando:

### Passo 1: Verificar se a Tabela Existe

1. Abra o Supabase Dashboard → **SQL Editor**
2. Execute esta query para verificar:
```sql
SELECT * FROM public.site_settings;
```

**Se der erro "relation does not exist":**
- A tabela não foi criada
- Execute o arquivo `EXECUTAR_MIGRACAO_SETTINGS.sql` no SQL Editor

---

### Passo 2: Criar a Tabela (se não existir)

1. Abra o arquivo `EXECUTAR_MIGRACAO_SETTINGS.sql`
2. Copie TODO o conteúdo
3. Cole no Supabase SQL Editor
4. Execute (Run ou Ctrl+Enter)
5. Você deve ver mensagem de sucesso

---

### Passo 3: Verificar Políticas RLS

A tabela precisa ter políticas RLS configuradas:

```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies 
WHERE tablename = 'site_settings';
```

**Deve aparecer:**
- ✅ "Anyone can view settings" (SELECT)
- ✅ "Admins can manage settings" (ALL)

**Se não aparecer:**
- Execute o SQL `EXECUTAR_MIGRACAO_SETTINGS.sql` novamente
- Ou execute apenas a parte de políticas:

```sql
-- Políticas RLS para site_settings
DROP POLICY IF EXISTS "Anyone can view settings" ON public.site_settings;
CREATE POLICY "Anyone can view settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
  );
```

---

### Passo 4: Verificar se Você é Admin

Execute no SQL Editor:

```sql
-- Ver seu status de admin
SELECT email, is_admin 
FROM public.profiles 
WHERE user_id = auth.uid();
```

**Se `is_admin` for `false`:**
```sql
-- Tornar admin (substitua pelo seu email)
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'seu-email@aqui.com';
```

---

### Passo 5: Testar no App

1. **Recarregue a página** do admin (F5 ou Ctrl+R)
2. Vá na aba **"Personalizar"**
3. Abra o **Console do navegador** (F12)
4. Tente salvar as personalizações
5. Veja as mensagens no console

**No console, você deve ver:**
- ✅ `💾 Salvando personalizações: {...}`
- ✅ `📤 Atualizações a fazer: [...]`
- ✅ `✅ platform_name salvo com sucesso`
- ✅ etc.

**Se aparecer erro:**
- Copie a mensagem do console
- Verifique qual dos passos acima precisa ser corrigido

---

## ✅ Checklist Final

Antes de testar, confirme:

- [ ] Tabela `site_settings` existe (Passo 1)
- [ ] Políticas RLS estão configuradas (Passo 3)
- [ ] Você é admin (Passo 4)
- [ ] Console do navegador está aberto (Passo 5)
- [ ] Página foi recarregada

---

## 🚨 Erros Comuns

### Erro: "relation does not exist"
**Solução:** Execute `EXECUTAR_MIGRACAO_SETTINGS.sql`

### Erro: "permission denied" ou "row-level security"
**Solução:** 
1. Verifique se você é admin (Passo 4)
2. Verifique as políticas RLS (Passo 3)

### Erro: "onConflict" não funciona
**Solução:** Verifique se a coluna `key` tem constraint UNIQUE:
```sql
ALTER TABLE public.site_settings 
ADD CONSTRAINT site_settings_key_unique UNIQUE (key);
```

---

## 📝 SQL Completo para Recriar Tudo

Se nada funcionar, execute este SQL completo:

```sql
-- Remover tabela se existir (CUIDADO: apaga dados!)
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- Recriar tabela
CREATE TABLE public.site_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anyone can view settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Dados padrão
INSERT INTO public.site_settings (key, value) VALUES
  ('platform_name', 'método sociedade'),
  ('logo_url', ''),
  ('primary_color', '#8b5cf6'),
  ('theme', 'dark')
ON CONFLICT (key) DO NOTHING;
```

Depois de executar, teste novamente! 🚀


