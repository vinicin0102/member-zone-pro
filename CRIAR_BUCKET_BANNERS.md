# 📦 Criar Bucket "banners" no Supabase

## ⚡ Resumo Rápido (2 minutos)

O erro aparece porque o bucket de storage não existe. Siga estes passos:

---

## 📋 Passo a Passo Visual

### 1️⃣ Acesse o Supabase Dashboard

🌐 **URL:** https://supabase.com/dashboard

Faça login e selecione seu projeto.

---

### 2️⃣ Vá em Storage

No menu lateral esquerdo, clique em:
```
📁 Storage
```

---

### 3️⃣ Criar Novo Bucket

1. Clique no botão **"New bucket"** (ou **"Create bucket"**)
   
2. Na janela que abrir, preencha:

   ```
   Name: banners
   ```
   ⚠️ **Importante:** Use exatamente `banners` (minúsculas, sem espaços)

3. **Marque a opção:**
   ```
   ☑️ Public bucket
   ```
   ⚠️ **MUITO IMPORTANTE:** Esta opção DEVE estar marcada!

4. Clique em **"Create bucket"**

---

### 4️⃣ Configurar Permissões (Políticas RLS)

1. Ainda no Supabase Dashboard, clique em **"SQL Editor"** (menu lateral)

2. Clique em **"New query"**

3. Abra o arquivo `CREATE_BANNER_STORAGE_BUCKET.sql` no seu projeto

4. Copie TODO o conteúdo do arquivo

5. Cole no SQL Editor

6. Clique em **"Run"** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

7. Você deve ver uma mensagem de sucesso ✅

---

### 5️⃣ Voltar para o App

1. Volte para seu app em `localhost`
2. **Recarregue a página** (F5 ou Ctrl+R / Cmd+R)
3. Vá em `/admin` → Aba **"Banner"**
4. Tente fazer upload novamente

---

## ✅ Como Saber se Funcionou

Depois de criar o bucket, você deve ver:

- ✅ No Supabase Dashboard → Storage → Lista de buckets:
  ```
  📁 banners (público) ✅
  ```

- ✅ No app, ao fazer upload:
  - Não aparece mais o erro vermelho
  - Mostra "Upload concluído!"
  - Imagem aparece no preview

---

## ❌ Troubleshooting

### Erro continua aparecendo?

**Verifique:**

1. ✅ Bucket criado com nome exato: `banners` (minúsculas)
2. ✅ Bucket está marcado como **Público**
3. ✅ SQL das políticas foi executado com sucesso
4. ✅ Você recarregou a página do app
5. ✅ Você está logado como admin

### Como verificar se o bucket é público:

1. Vá em Storage → Clique no bucket `banners`
2. Vá em "Settings" (Configurações)
3. Verifique: **"Public bucket"** deve estar **ON**

### Ainda não funciona?

1. **Limpe o cache do navegador:**
   - Chrome/Edge: `Ctrl+Shift+Delete` → Limpar cache
   - Mac: `Cmd+Shift+Delete` → Limpar cache

2. **Faça logout e login novamente:**
   - No app, saia e entre novamente

3. **Verifique o console do navegador:**
   - F12 → Console
   - Veja se há outros erros além do bucket

---

## 🎯 Checklist Final

Antes de testar, confirme:

- [ ] Bucket `banners` criado no Supabase
- [ ] Bucket está marcado como Público
- [ ] SQL das políticas executado com sucesso
- [ ] Página do app foi recarregada
- [ ] Está logado como admin

Se todos os itens estão marcados, o upload deve funcionar! 🚀


