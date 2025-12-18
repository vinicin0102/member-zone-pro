# 🔍 Verificar e Corrigir Problemas com o Bucket

## ✅ Checklist de Verificação

Siga estes passos para identificar o problema:

---

## 1️⃣ Verificar se o Bucket Existe

**No Supabase Dashboard:**
1. Vá em **Storage** (menu lateral)
2. Verifique se o bucket `banners` aparece na lista
3. Se não aparecer, crie novamente

**Como deve aparecer:**
```
📁 banners (público) ✅
```

---

## 2️⃣ Verificar se o Bucket é Público

**No Supabase Dashboard:**
1. Vá em **Storage** → Clique no bucket `banners`
2. Vá em **"Settings"** ou **"Configurações"**
3. Verifique se **"Public bucket"** está **ON** ✅

**Se estiver OFF:**
- Clique para ativar
- Salve as alterações

---

## 3️⃣ Verificar se as Políticas RLS Foram Executadas

**No Supabase Dashboard:**
1. Vá em **Storage** → Clique no bucket `banners`
2. Vá em **"Policies"** ou **"Políticas"**
3. Você deve ver 4 políticas:
   - ✅ "Banner images are publicly accessible" (SELECT)
   - ✅ "Admins can upload banner images" (INSERT)
   - ✅ "Admins can update banner images" (UPDATE)
   - ✅ "Admins can delete banner images" (DELETE)

**Se não aparecerem:**
1. Vá em **SQL Editor**
2. Abra e execute o arquivo `CREATE_BANNER_STORAGE_BUCKET.sql`
3. Verifique se não houve erros na execução

---

## 4️⃣ Verificar se Você Está Logado como Admin

**No seu app:**
1. Verifique se você está logado
2. Verifique se seu email é admin
3. Se não for admin:
   - Execute o SQL para tornar seu usuário admin
   - Faça logout e login novamente

**SQL para verificar/definir admin:**
```sql
-- Ver se você é admin
SELECT email, is_admin FROM profiles WHERE user_id = auth.uid();

-- Tornar admin (substitua pelo seu email)
UPDATE profiles 
SET is_admin = true 
WHERE email = 'seu-email@exemplo.com';
```

---

## 5️⃣ Verificar Erros no Console

**No navegador:**
1. Pressione **F12** para abrir o DevTools
2. Vá na aba **"Console"**
3. Tente fazer upload novamente
4. Veja qual erro aparece

**Erros comuns e soluções:**

### Erro: "Bucket not found"
- ✅ Solução: Verifique se o bucket foi criado com o nome exato `banners`

### Erro: "row-level security" ou "RLS"
- ✅ Solução: Execute o SQL `CREATE_BANNER_STORAGE_BUCKET.sql`

### Erro: "permission denied"
- ✅ Solução: Verifique se você é admin (passo 4)

### Erro: "Bucket is private"
- ✅ Solução: Marque o bucket como público (passo 2)

---

## 6️⃣ Limpar Cache e Tentar Novamente

1. **Limpar cache do navegador:**
   - Chrome: `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
   - Selecione "Cached images and files"
   - Clique em "Clear data"

2. **Fazer logout e login novamente:**
   - No app, saia e entre novamente
   - Isso atualiza as permissões

3. **Recarregar a página:**
   - Pressione `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
   - Isso força o recarregamento completo

---

## 🚨 Se Ainda Não Funcionar

1. **Copie o erro completo do console** (F12 → Console)
2. **Verifique todos os passos acima**
3. **Execute este SQL para recriar as políticas:**

```sql
-- Remover todas as políticas do bucket banners
DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

-- Criar novamente (leria pública)
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Upload para admins (usando verificação direta)
CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  )
);
```

---

## ✅ Teste Final

Depois de verificar tudo:

1. ✅ Bucket existe e está público
2. ✅ Políticas RLS foram executadas
3. ✅ Você é admin
4. ✅ Cache foi limpo
5. ✅ Você fez logout e login novamente

Agora tente fazer upload novamente. Deve funcionar! 🚀


