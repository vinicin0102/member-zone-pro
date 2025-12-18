# Configuração de Webhook para Entrega Automática de Cursos

Este guia explica como configurar webhooks para liberação automática de acesso a cursos após confirmação de pagamento.

## 📋 Estrutura Criada

### 1. Tabela `payment_transactions`
Armazena todas as transações de pagamento com informações do gateway.

### 2. Função `process_payment_confirmation`
Processa automaticamente a confirmação de pagamento e libera acesso ao curso.

### 3. Edge Function `webhook-payment`
Recebe webhooks dos gateways de pagamento e processa as confirmações.

## 🚀 Passo a Passo

### Passo 1: Executar a Migration

Execute o SQL no Supabase SQL Editor:

```sql
-- O arquivo está em: supabase/migrations/20251210240000_create_payment_transactions.sql
```

Ou copie e execute o conteúdo do arquivo.

### Passo 2: Configurar Variáveis de Ambiente

No Supabase Dashboard:
1. Vá em **Project Settings** → **Edge Functions**
2. Configure as seguintes variáveis de ambiente:

```bash
WEBHOOK_SECRET=seu_secret_aqui  # Opcional, mas recomendado
SUPABASE_URL=https://seu-projeto.supabase.co  # Já configurado automaticamente
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key  # Já configurado automaticamente
```

### Passo 3: Deploy da Edge Function

Execute no terminal (se usar Supabase CLI):

```bash
supabase functions deploy webhook-payment
```

Ou use o Supabase Dashboard:
1. Vá em **Edge Functions**
2. Crie uma nova função chamada `webhook-payment`
3. Cole o código de `supabase/functions/webhook-payment/index.ts`

### Passo 4: Configurar Webhook no Gateway

#### Para Asaas:
1. Acesse: https://www.asaas.com → Configurações → Webhooks
2. URL do webhook: `https://seu-projeto.supabase.co/functions/v1/webhook-payment`
3. Headers: `x-gateway: asaas`
4. Eventos: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`

#### Para Stripe:
1. Acesse: https://dashboard.stripe.com → Developers → Webhooks
2. Add endpoint: `https://seu-projeto.supabase.co/functions/v1/webhook-payment`
3. Headers: `x-gateway: stripe`
4. Eventos: `payment_intent.succeeded`, `charge.succeeded`

#### Para Mercado Pago:
1. Acesse: https://www.mercadopago.com.br/developers → Webhooks
2. URL: `https://seu-projeto.supabase.co/functions/v1/webhook-payment`
3. Headers: `x-gateway: mercadopago`
4. Eventos: `payment`, `payment.updated`

### Passo 5: Criar Transação ao Gerar Link de Pagamento

Quando o usuário clicar em "Garantir Acesso Agora", você precisa:

1. Criar o pagamento no gateway
2. Criar o registro na tabela `payment_transactions`
3. Retornar o link de pagamento

Exemplo de código (adaptar ao seu gateway):

```typescript
// Ao gerar link de pagamento
const createPayment = async (userId: string, courseId: string) => {
  // 1. Criar pagamento no gateway (ex: Asaas, Stripe, etc)
  const gatewayResponse = await createPaymentInGateway({
    amount: 99.90,
    description: `Acesso ao curso: ${courseTitle}`,
    customerEmail: userEmail,
    // ... outros dados
  });

  // 2. Salvar transação no banco
  const { error } = await supabase
    .from('payment_transactions')
    .insert({
      user_id: userId,
      course_id: courseId,
      transaction_id: gatewayResponse.id, // ID retornado pelo gateway
      gateway_name: 'asaas', // ou 'stripe', 'mercadopago', etc
      status: 'pending',
      amount: 99.90,
      currency: 'BRL',
      metadata: {
        payment_url: gatewayResponse.paymentUrl, // Link do checkout
        // ... outros dados
      }
    });

  // 3. Retornar link de pagamento
  return gatewayResponse.paymentUrl;
};
```

## 🔄 Fluxo Completo

1. **Usuário clica em "Garantir Acesso Agora"**
   - Frontend chama função para criar pagamento
   - Transação é criada no banco com status `pending`
   - Link de pagamento é retornado ao usuário

2. **Usuário completa o pagamento no gateway**
   - Gateway processa o pagamento
   - Gateway envia webhook para `webhook-payment`

3. **Webhook processa a confirmação**
   - Edge Function recebe o webhook
   - Busca a transação no banco pelo `transaction_id`
   - Chama `process_payment_confirmation`
   - Libera acesso ao curso na tabela `user_course_access`
   - Atualiza status da transação para `paid`

4. **Usuário recebe acesso automaticamente**
   - Na próxima vez que acessar a área de membros
   - O curso bloqueado estará liberado
   - Pode acessar os módulos normalmente

## 🔒 Segurança

### Proteção por Secret
Configure um `WEBHOOK_SECRET` e valide no gateway:
- Asaas: Configure o secret nas configurações do webhook
- Stripe: Use a assinatura do webhook
- Mercado Pago: Configure o secret no webhook

### Validação de Payload
A função valida:
- Transaction ID existe no banco
- Gateway corresponde ao esperado
- Status é válido

## 📊 Monitoramento

Você pode monitorar as transações na tabela `payment_transactions`:

```sql
-- Ver todas as transações
SELECT * FROM payment_transactions ORDER BY created_at DESC;

-- Ver apenas pagamentos confirmados
SELECT * FROM payment_transactions WHERE status = 'paid';

-- Ver transações pendentes
SELECT * FROM payment_transactions WHERE status = 'pending';

-- Ver transações de um usuário
SELECT * FROM payment_transactions WHERE user_id = 'USER_ID_AQUI';
```

## 🐛 Troubleshooting

### Webhook não está sendo recebido
- Verifique se a URL está correta
- Verifique se a Edge Function foi deployada
- Verifique os logs da Edge Function no Supabase Dashboard

### Pagamento confirmado mas acesso não liberado
- Verifique os logs da função `process_payment_confirmation`
- Verifique se o `transaction_id` corresponde
- Verifique se o `user_id` está correto na transação

### Erro de autenticação
- Verifique se o `WEBHOOK_SECRET` está configurado corretamente
- Verifique se o gateway está enviando o header correto

## 📝 Exemplo de Payload do Webhook

### Asaas:
```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_123456789",
    "status": "CONFIRMED",
    "value": 99.90,
    "customer": {
      "email": "usuario@email.com"
    }
  }
}
```

### Stripe:
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_123456789",
      "status": "succeeded",
      "amount": 9990,
      "customer_email": "usuario@email.com"
    }
  }
}
```

## 🎯 Próximos Passos

1. Integrar a criação de pagamento na página de oferta
2. Adicionar página de confirmação de pagamento
3. Adicionar notificações por email quando acesso for liberado
4. Adicionar histórico de compras na área de membros


