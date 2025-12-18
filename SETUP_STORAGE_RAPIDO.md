# 🚀 Configuração Rápida do Storage para Banner

## ⚠️ Erro Atual:
```
Bucket de storage não configurado. Configure o bucket "banners" no Supabase.
```

## ✅ Solução em 3 Passos:

### Passo 1: Criar o Bucket (2 minutos)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"Storage"**
4. Clique no botão **"New bucket"** (ou **"Create bucket"**)
5. Preencha:
   - **Name:** `banners` (exatamente assim, em minúsculas)
   - **Public bucket:** ✅ **MARQUE ESTA OPÇÃO** (muito importante!)
   - Clique em **"Create bucket"**

### Passo 2: Configurar Políticas (1 minuto)

1. No Supabase Dashboard, vá em **"SQL Editor"** (no menu lateral)
2. Clique em **"New query"**
3. Copie e cole o conteúdo do arquivo `CREATE_BANNER_STORAGE_BUCKET.sql`
4. Clique em **"Run"** (ou pressione Ctrl+Enter / Cmd+Enter)

### Passo 3: Testar (30 segundos)

1. Volte para seu app em `localhost`
2. Recarregue a página (F5)
3. Vá em `/admin` → Aba **"Banner"**
4. Clique em **"Escolher Arquivo"**
5. Selecione uma imagem
6. Clique em **"Salvar Banner"**

## ✅ Pronto!

Se tudo deu certo, você verá:
- ✅ Preview da imagem
- ✅ Upload concluído
- ✅ Banner salvo com sucesso

## ❌ Se ainda der erro:

1. **Verifique se o bucket está público:**
   - Storage → banners → Settings → Public bucket: ON

2. **Verifique se executou o SQL:**
   - SQL Editor → Verifique se as políticas foram criadas

3. **Verifique se está logado como admin:**
   - Faça logout e login novamente

4. **Limpe o cache:**
   - Recarregue a página (Ctrl+Shift+R / Cmd+Shift+R)

## 📸 Screenshot do que você deve ver no Dashboard:

```
Storage
  └── buckets
      └── banners (público) ✅
```

---

**Tempo total:** ~3 minutos ⏱️


