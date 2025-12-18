# 🚀 Deploy da Edge Function webhook-payment

O erro 404 acontece porque a Edge Function ainda não foi deployada no Supabase.

## Opção 1: Deploy via Dashboard do Supabase (Mais Fácil) ✅

1. **Acesse o Supabase Dashboard**
   - Vá em: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Criar a Edge Function**
   - No menu lateral, clique em **"Edge Functions"**
   - Clique em **"Create a new function"**
   - Nome da função: `webhook-payment`
   - Clique em **"Create function"**

3. **Colar o código**
   - Copie TODO o conteúdo do arquivo: `supabase/functions/webhook-payment/index.ts`
   - Cole no editor que aparecer
   - Clique em **"Deploy"** ou **"Save"**

4. **Pronto!** A função estará disponível em:
   ```
   https://seu-projeto.supabase.co/functions/v1/webhook-payment
   ```

## Opção 2: Deploy via CLI (Se tiver Supabase CLI instalado)

```bash
# 1. Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# 2. Fazer login no Supabase
supabase login

# 3. Linkar com o projeto (se necessário)
supabase link --project-ref seu-project-ref

# 4. Deploy da função
supabase functions deploy webhook-payment
```

## ⚠️ Importante

Depois do deploy, a URL do webhook no painel admin estará correta e o erro 404 desaparecerá.

A função precisa estar deployada para que o sistema de webhook funcione!

## 🔍 Verificar se está funcionando

1. No Dashboard do Supabase, vá em **Edge Functions**
2. Clique em `webhook-payment`
3. Você deve ver os logs e configurações da função

## 📝 Nota

O erro 404 apareceu porque o código está tentando acessar:
```
https://seu-projeto.supabase.co/functions/v1/webhook-payment
```

Mas essa função ainda não existe no seu projeto Supabase. Depois do deploy, tudo funcionará! ✅

