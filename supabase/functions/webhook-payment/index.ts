import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  event?: string;
  status?: string;
  id?: string;
  transaction_id?: string;
  customer?: {
    email?: string;
    id?: string;
  };
  subscription?: {
    user_id?: string;
  };
  // Dados genéricos para diferentes gateways
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obter configurações
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar secret se configurado
    const authHeader = req.headers.get('authorization');
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obter dados do webhook
    const payload: WebhookPayload = await req.json()
    
    console.log('📥 Webhook recebido:', {
      event: payload.event || payload.status,
      transactionId: payload.id || payload.transaction_id,
      gateway: req.headers.get('x-gateway') || 'unknown'
    })

    // Detectar gateway pelo header ou payload
    const gatewayName = req.headers.get('x-gateway') || 
                       payload.gateway || 
                       detectGatewayFromPayload(payload) || 
                       'unknown';

    // Processar baseado no gateway
    let transactionId: string;
    let status: string;
    let userEmail: string | null = null;
    let userId: string | null = null;
    let amount: number | null = null;

    // Normalizar dados do payload para diferentes gateways
    if (gatewayName === 'asaas' || payload.event?.includes('PAYMENT')) {
      // Asaas
      transactionId = payload.id || payload.transaction_id || '';
      status = normalizeAsaasStatus(payload.status);
      userEmail = payload.customer?.email || payload.customer_email || null;
      amount = parseFloat(payload.value || payload.amount || '0');
    } else if (gatewayName === 'stripe' || payload.type) {
      // Stripe
      transactionId = payload.data?.object?.id || payload.id || '';
      status = normalizeStripeStatus(payload.data?.object?.status || payload.status);
      userEmail = payload.data?.object?.customer_email || payload.customer_email || null;
      amount = parseFloat(payload.data?.object?.amount || payload.amount || '0') / 100; // Stripe usa centavos
    } else if (gatewayName === 'mercadopago' || payload.type === 'payment') {
      // Mercado Pago
      transactionId = payload.data?.id || payload.id || '';
      status = normalizeMercadoPagoStatus(payload.data?.status || payload.status);
      userEmail = payload.data?.payer?.email || null;
      amount = parseFloat(payload.data?.transaction_amount || payload.amount || '0');
    } else {
      // Gateway genérico - tentar extrair campos comuns
      transactionId = payload.id || payload.transaction_id || payload.payment_id || '';
      status = normalizeGenericStatus(payload.status || payload.event);
      userEmail = payload.customer?.email || payload.email || payload.user_email || null;
      amount = parseFloat(payload.amount || payload.value || '0');
    }

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID not found in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar transação no banco
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('gateway_name', gatewayName)
      .maybeSingle()

    if (transactionError || !transaction) {
      console.error('❌ Transação não encontrada:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Transaction not found', transaction_id: transactionId }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Processar confirmação de pagamento
    if (status === 'paid' || status === 'approved') {
      const { data: result, error: processError } = await supabase.rpc(
        'process_payment_confirmation',
        {
          p_transaction_id: transactionId,
          p_gateway_name: gatewayName,
          p_status: 'paid',
          p_user_email: userEmail,
          p_user_id: transaction.user_id,
          p_webhook_data: payload
        }
      )

      if (processError) {
        console.error('❌ Erro ao processar pagamento:', processError);
        return new Response(
          JSON.stringify({ error: 'Failed to process payment', details: processError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Pagamento processado com sucesso:', result);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed successfully',
          result 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Atualizar apenas o status
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: status,
          webhook_data: payload,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error('❌ Erro ao atualizar transação:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Transaction status updated', status }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Funções auxiliares
function detectGatewayFromPayload(payload: WebhookPayload): string | null {
  if (payload.event?.includes('PAYMENT') || payload.object === 'payment') return 'asaas';
  if (payload.type?.startsWith('payment') || payload.object === 'charge') return 'stripe';
  if (payload.type === 'payment' || payload.action === 'payment.updated') return 'mercadopago';
  return null;
}

function normalizeAsaasStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'CONFIRMED': 'paid',
    'RECEIVED': 'paid',
    'RECEIVED_IN_CASH': 'paid',
    'OVERDUE': 'failed',
    'PENDING': 'pending',
    'REFUNDED': 'refunded',
    'CANCELLED': 'cancelled'
  };
  return statusMap[status] || status.toLowerCase();
}

function normalizeStripeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'succeeded': 'paid',
    'paid': 'paid',
    'pending': 'pending',
    'failed': 'failed',
    'canceled': 'cancelled',
    'refunded': 'refunded'
  };
  return statusMap[status] || status.toLowerCase();
}

function normalizeMercadoPagoStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'approved': 'paid',
    'authorized': 'pending',
    'pending': 'pending',
    'in_process': 'pending',
    'in_mediation': 'pending',
    'rejected': 'failed',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'charged_back': 'refunded'
  };
  return statusMap[status] || status.toLowerCase();
}

function normalizeGenericStatus(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('paid') || lowerStatus.includes('approved') || lowerStatus.includes('confirmed')) {
    return 'paid';
  }
  if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
    return 'pending';
  }
  if (lowerStatus.includes('failed') || lowerStatus.includes('rejected')) {
    return 'failed';
  }
  if (lowerStatus.includes('cancelled') || lowerStatus.includes('canceled')) {
    return 'cancelled';
  }
  if (lowerStatus.includes('refund')) {
    return 'refunded';
  }
  return 'pending';
}


