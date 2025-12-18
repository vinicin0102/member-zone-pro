# ⚡ Setup Rápido de Webhook - Entrega Automática

## 📋 Passos para Configurar

### 1️⃣ Executar Migration SQL

No Supabase SQL Editor, execute:

```sql
-- Arquivo: supabase/migrations/20251210240000_create_payment_transactions.sql
-- Copie e cole todo o conteúdo do arquivo
```

### 2️⃣ Deployar Edge Function

**Opção A - Via Dashboard:**
1. Vá em **Supabase Dashboard** → **Edge Functions**
2. Clique em **Create Function**
3. Nome: `webhook-payment`
4. Cole o código de `supabase/functions/webhook-payment/index.ts`
5. Clique em **Deploy**

**Opção B - Via CLI:**
```bash
supabase functions deploy webhook-payment
```

### 3️⃣ Configurar Variável de Ambiente (Opcional mas Recomendado)

No Dashboard → Edge Functions → `webhook-payment` → Settings:

Adicione:
```
WEBHOOK_SECRET=seu_secret_super_seguro_aqui_123456
```

### 4️⃣ Configurar Webhook no Gateway

**URL do Webhook:**
```
https://SEU_PROJETO_ID.supabase.co/functions/v1/webhook-payment
```

**Headers:**
```
x-gateway: asaas
```

(Substitua `asaas` pelo seu gateway: `stripe`, `mercadopago`, etc.)

### 5️⃣ Criar Transação ao Gerar Pagamento

Quando o usuário clica em comprar, você precisa:

1. Criar o pagamento no seu gateway
2. Salvar a transação no banco antes de redirecionar

**Exemplo mínimo:**

```typescript
// 1. Criar pagamento no gateway (seu código aqui)
const gatewayPayment = await criarPagamentoNoGateway({
  valor: 99.90,
  descricao: `Curso: ${cursoTitulo}`,
  emailCliente: usuarioEmail
});

// 2. Salvar transação
await supabase.from('payment_transactions').insert({
  user_id: userId,
  course_id: courseId,
  transaction_id: gatewayPayment.id, // ID retornado pelo gateway
  gateway_name: 'asaas', // seu gateway
  status: 'pending',
  amount: 99.90,
  currency: 'BRL',
  metadata: {
    payment_url: gatewayPayment.url
  }
});

// 3. Redirecionar para checkout
window.location.href = gatewayPayment.url;
```

## 🔄 Como Funciona

1. **Usuário compra** → Transação criada (status: `pending`)
2. **Pagamento confirmado** → Gateway envia webhook
3. **Webhook recebido** → Edge Function processa
4. **Acesso liberado** → Automaticamente na tabela `user_course_access`
5. **Usuário tem acesso** → Próxima vez que entrar, o curso está liberado

## 🧪 Testar Manualmente

Você pode simular um webhook testando a função SQL:

```sql
-- 1. Criar uma transação de teste
INSERT INTO payment_transactions (
  user_id,
  course_id,
  transaction_id,
  gateway_name,
  status,
  amount
) VALUES (
  'USER_ID_AQUI',
  'COURSE_ID_AQUI',
  'test_transaction_123',
  'test',
  'pending',
  99.90
);

-- 2. Processar pagamento (simular webhook)
SELECT public.process_payment_confirmation(
  'test_transaction_123', -- transaction_id
  'test',                 -- gateway_name
  'paid',                 -- status
  NULL,                   -- user_email (opcional)
  NULL,                   -- user_id (opcional)
  '{"test": true}'::jsonb -- webhook_data
);
```

## 📊 Verificar se Funcionou

```sql
-- Ver transações
SELECT * FROM payment_transactions ORDER BY created_at DESC;

-- Ver acessos liberados
SELECT * FROM user_course_access ORDER BY granted_at DESC;

-- Ver tudo junto
SELECT 
  pt.transaction_id,
  pt.status,
  pt.amount,
  c.title as curso,
  p.email as usuario,
  uca.granted_at as acesso_liberado_em
FROM payment_transactions pt
LEFT JOIN courses c ON c.id = pt.course_id
LEFT JOIN profiles p ON p.user_id = pt.user_id
LEFT JOIN user_course_access uca ON uca.user_id = pt.user_id AND uca.course_id = pt.course_id
ORDER BY pt.created_at DESC;
```

## ⚠️ Importante

- O `transaction_id` deve ser o **mesmo ID** retornado pelo gateway
- O `gateway_name` deve corresponder ao gateway configurado
- O webhook deve enviar o header `x-gateway` com o nome do gateway
- Teste primeiro com pagamentos de valor baixo/sandbox

## 🆘 Problemas Comuns

**Webhook não chega:**
- Verifique se a URL está correta
- Verifique se a Edge Function foi deployada
- Verifique logs da Edge Function no Dashboard

**Pagamento confirmado mas acesso não liberado:**
- Verifique se o `transaction_id` corresponde
- Verifique logs da função `process_payment_confirmation`
- Verifique se o usuário está correto na transação


