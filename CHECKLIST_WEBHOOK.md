# ✅ Checklist de Configuração de Webhook

## ✅ Concluído
- [x] Migration SQL executada
- [x] Tabela `payment_transactions` criada
- [x] Função `process_payment_confirmation` criada
- [x] Políticas RLS configuradas

## 📋 Próximos Passos

### 1. Deploy da Edge Function

**Opção A - Via Dashboard:**
1. Acesse: Supabase Dashboard → **Edge Functions**
2. Clique em **Create Function**
3. Nome da função: `webhook-payment`
4. Cole o código de: `supabase/functions/webhook-payment/index.ts`
5. Clique em **Deploy**

**Opção B - Via CLI:**
```bash
supabase functions deploy webhook-payment
```

### 2. Configurar Variável de Ambiente (Recomendado)

No Dashboard → Edge Functions → `webhook-payment` → Settings → Secrets:

Adicione:
```
WEBHOOK_SECRET=seu_secret_super_seguro_aqui
```

⚠️ **Importante:** Anote este secret para usar na configuração do webhook no seu gateway.

### 3. Configurar Webhook no Gateway

**URL do Webhook:**
```
https://SEU_PROJETO_ID.supabase.co/functions/v1/webhook-payment
```

**Headers obrigatórios:**
```
x-gateway: asaas
Authorization: Bearer seu_secret_super_seguro_aqui
```

(Substitua `asaas` pelo nome do seu gateway: `stripe`, `mercadopago`, etc.)

**Onde encontrar o PROJETO_ID:**
- Dashboard → Project Settings → General → Reference ID

### 4. Integrar no Frontend

Quando o usuário clicar em "Garantir Acesso Agora", você precisa:

1. Criar pagamento no gateway
2. Salvar transação no banco
3. Redirecionar para checkout

**Exemplo de código:**
```typescript
// Ao criar pagamento no gateway
const gatewayResponse = await criarPagamentoNoGateway({
  valor: 99.90,
  descricao: `Curso: ${cursoTitulo}`,
  emailCliente: userEmail
});

// Salvar transação ANTES de redirecionar
await supabase.from('payment_transactions').insert({
  user_id: userId,
  course_id: courseId,
  transaction_id: gatewayResponse.id, // ID retornado pelo gateway
  gateway_name: 'asaas', // seu gateway
  status: 'pending',
  amount: 99.90,
  currency: 'BRL',
  metadata: {
    payment_url: gatewayResponse.url
  }
});

// Redirecionar para checkout
window.location.href = gatewayResponse.url;
```

## 🧪 Como Testar

### Teste Manual 1: Criar Transação
```sql
-- Substitua os IDs pelos seus
INSERT INTO payment_transactions (
  user_id,
  course_id,
  transaction_id,
  gateway_name,
  status,
  amount
) VALUES (
  'SEU_USER_ID',
  'SEU_COURSE_ID',
  'test_123',
  'test',
  'pending',
  99.90
);
```

### Teste Manual 2: Simular Webhook
```sql
-- Processar pagamento manualmente
SELECT public.process_payment_confirmation(
  'test_123',    -- transaction_id
  'test',        -- gateway_name
  'paid',        -- status
  NULL,          -- user_email
  NULL,          -- user_id
  '{"test": true}'::jsonb
);
```

### Teste Manual 3: Verificar Acesso
```sql
-- Verificar se o acesso foi liberado
SELECT * FROM user_course_access 
WHERE user_id = 'SEU_USER_ID' 
AND course_id = 'SEU_COURSE_ID';
```

## 📊 Monitoramento

### Ver todas as transações:
```sql
SELECT 
  pt.*,
  c.title as curso,
  p.email as usuario
FROM payment_transactions pt
LEFT JOIN courses c ON c.id = pt.course_id
LEFT JOIN profiles p ON p.user_id = pt.user_id
ORDER BY pt.created_at DESC;
```

### Ver transações pendentes:
```sql
SELECT * FROM payment_transactions 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Ver acessos liberados:
```sql
SELECT 
  uca.*,
  c.title as curso,
  p.email as usuario
FROM user_course_access uca
LEFT JOIN courses c ON c.id = uca.course_id
LEFT JOIN profiles p ON p.user_id = uca.user_id
ORDER BY uca.granted_at DESC;
```

## 🆘 Troubleshooting

### Webhook não está chegando
- ✅ Verifique se a Edge Function foi deployada
- ✅ Verifique a URL do webhook no gateway
- ✅ Verifique os logs da Edge Function no Dashboard

### Pagamento confirmado mas acesso não liberado
- ✅ Verifique se o `transaction_id` corresponde ao do gateway
- ✅ Verifique logs da função `process_payment_confirmation`
- ✅ Verifique se o `gateway_name` está correto

### Erro de autenticação
- ✅ Verifique se o `WEBHOOK_SECRET` está configurado
- ✅ Verifique se o gateway está enviando o header `Authorization`

## 🎯 Pronto quando:
- [ ] Edge Function deployada
- [ ] Webhook configurado no gateway
- [ ] Variável de ambiente configurada
- [ ] Integração no frontend feita
- [ ] Teste realizado com sucesso

## 📝 Próximas Melhorias (Opcional)
- [ ] Página de confirmação de pagamento
- [ ] Notificações por email
- [ ] Histórico de compras na área de membros
- [ ] Webhook de reembolso


