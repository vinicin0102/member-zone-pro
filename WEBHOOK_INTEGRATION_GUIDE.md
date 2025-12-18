# 🎯 Guia de Integração de Webhook para Entrega Automática

## 📦 O que foi criado:

1. **Tabela `payment_transactions`** - Armazena todas as transações
2. **Edge Function `webhook-payment`** - Recebe webhooks dos gateways
3. **Função `process_payment_confirmation`** - Libera acesso automaticamente
4. **Helper `paymentHelper.ts`** - Funções auxiliares para criar transações

## 🚀 Como Funciona:

### Fluxo Completo:

```
1. Usuário clica em "Garantir Acesso Agora"
   ↓
2. Sistema cria pagamento no gateway
   ↓
3. Transação é salva no banco (status: pending)
   ↓
4. Usuário é redirecionado para checkout
   ↓
5. Usuário completa pagamento
   ↓
6. Gateway envia webhook → Edge Function
   ↓
7. Webhook processa e libera acesso automaticamente
   ↓
8. Usuário tem acesso ao curso imediatamente
```

## ⚙️ Configuração Inicial

### 1. Execute a Migration SQL

```sql
-- Execute o arquivo:
-- supabase/migrations/20251210240000_create_payment_transactions.sql
```

### 2. Configure a Edge Function

**Via Supabase Dashboard:**
1. Vá em **Edge Functions**
2. Clique em **Create Function**
3. Nome: `webhook-payment`
4. Cole o código de `supabase/functions/webhook-payment/index.ts`
5. Deploy

**Via CLI:**
```bash
supabase functions deploy webhook-payment
```

### 3. Configure Variáveis de Ambiente

No Supabase Dashboard → Edge Functions → `webhook-payment` → Settings:

```bash
WEBHOOK_SECRET=seu_secret_super_seguro_aqui
```

### 4. Configure Webhook no Seu Gateway

**URL do Webhook:**
```
https://SEU_PROJETO.supabase.co/functions/v1/webhook-payment
```

**Headers necessários:**
```
x-gateway: asaas  (ou stripe, mercadopago, etc)
```

**Eventos para configurar:**
- ✅ Pagamento confirmado/aprovado
- ✅ Pagamento recebido
- ✅ Status atualizado

## 🔧 Integrando com Seu Gateway

### Exemplo: Asaas

1. **Criar pagamento:**
```typescript
// Em paymentHelper.ts, implemente:
async function createPaymentInGateway(gatewayName: string, config: any) {
  if (gatewayName === 'asaas') {
    const response = await fetch('https://www.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.VITE_ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: config.amount,
        description: config.description,
        dueDate: new Date().toISOString().split('T')[0],
        callback: {
          successUrl: config.returnUrl
        }
      })
    });
    
    const data = await response.json();
    return {
      success: true,
      transactionId: data.id,
      paymentUrl: data.invoiceUrl
    };
  }
}
```

2. **Configurar webhook no Asaas:**
   - URL: `https://seu-projeto.supabase.co/functions/v1/webhook-payment`
   - Evento: `PAYMENT_CONFIRMED`
   - Headers: `x-gateway: asaas`

## 📝 Exemplo de Uso no Frontend

```typescript
import { createPaymentTransaction } from '@/utils/paymentHelper';

// Ao clicar no botão de compra
const handlePurchase = async () => {
  const result = await createPaymentTransaction(
    courseId,
    99.90, // valor
    'asaas', // gateway
    {
      description: `Acesso ao curso: ${courseTitle}`,
      customerEmail: user.email,
      customerName: user.full_name,
      returnUrl: `${window.location.origin}/members?payment=success`
    }
  );

  if (result.success && result.paymentUrl) {
    // Redirecionar para checkout
    window.location.href = result.paymentUrl;
  } else {
    toast({
      title: 'Erro',
      description: result.error || 'Erro ao criar pagamento',
      variant: 'destructive'
    });
  }
};
```

## 🔍 Monitoramento

### Ver transações no banco:
```sql
SELECT 
  pt.*,
  c.title as course_title,
  p.email as user_email
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
  c.title as course_title,
  p.email as user_email
FROM user_course_access uca
LEFT JOIN courses c ON c.id = uca.course_id
LEFT JOIN profiles p ON p.user_id = uca.user_id
ORDER BY uca.granted_at DESC;
```

## ✅ Testando

1. Crie uma transação de teste no admin
2. Simule um webhook (ou use o sandbox do gateway)
3. Verifique se o acesso foi liberado automaticamente

## 🎯 Próximos Passos

- [ ] Implementar integração com seu gateway específico
- [ ] Adicionar página de confirmação de pagamento
- [ ] Adicionar notificações por email
- [ ] Adicionar histórico de compras na área de membros


