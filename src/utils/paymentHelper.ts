import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Cria uma transação de pagamento e retorna o link do checkout
 * 
 * @param courseId ID do curso
 * @param amount Valor do pagamento
 * @param gatewayName Nome do gateway (asaas, stripe, mercadopago, etc)
 * @param gatewayConfig Configurações específicas do gateway
 * @returns URL do checkout ou erro
 */
export async function createPaymentTransaction(
  courseId: string,
  amount: number,
  gatewayName: string,
  gatewayConfig: {
    description?: string;
    customerEmail?: string;
    customerName?: string;
    returnUrl?: string;
    webhookUrl?: string;
    [key: string]: any;
  }
): Promise<{ success: boolean; paymentUrl?: string; transactionId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // 1. Criar pagamento no gateway (implementar conforme seu gateway)
    // Esta é uma função placeholder - você precisa implementar a integração com seu gateway
    const gatewayResponse = await createPaymentInGateway(gatewayName, {
      amount,
      description: gatewayConfig.description || `Acesso ao curso`,
      customerEmail: gatewayConfig.customerEmail || user.email || '',
      customerName: gatewayConfig.customerName || '',
      returnUrl: gatewayConfig.returnUrl || `${window.location.origin}/members`,
      webhookUrl: gatewayConfig.webhookUrl || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-payment`,
      metadata: {
        course_id: courseId,
        user_id: user.id
      }
    });

    if (!gatewayResponse.success) {
      return { success: false, error: gatewayResponse.error || 'Erro ao criar pagamento no gateway' };
    }

    // 2. Salvar transação no banco
    const { data: transaction, error: transactionError } = await (supabase as any)
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        course_id: courseId,
        transaction_id: gatewayResponse.transactionId,
        gateway_name: gatewayName,
        status: 'pending',
        amount: amount,
        currency: 'BRL',
        payment_method: gatewayResponse.paymentMethod || null,
        metadata: {
          payment_url: gatewayResponse.paymentUrl,
          ...gatewayResponse.metadata
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Erro ao salvar transação:', transactionError);
      return { success: false, error: 'Erro ao salvar transação no banco' };
    }

    return {
      success: true,
      paymentUrl: gatewayResponse.paymentUrl,
      transactionId: gatewayResponse.transactionId
    };

  } catch (error: any) {
    console.error('Erro ao criar transação de pagamento:', error);
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
}

/**
 * Placeholder para integração com gateway de pagamento
 * Implemente conforme seu gateway específico
 */
async function createPaymentInGateway(
  gatewayName: string,
  config: {
    amount: number;
    description: string;
    customerEmail: string;
    customerName: string;
    returnUrl: string;
    webhookUrl: string;
    metadata: any;
  }
): Promise<{
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  paymentMethod?: string;
  metadata?: any;
  error?: string;
}> {
  // TODO: Implementar integração com seu gateway
  
  // Exemplo para Asaas:
  if (gatewayName === 'asaas') {
    const asaasApiKey = import.meta.env.VITE_ASAAS_API_KEY;
    const asaasUrl = import.meta.env.VITE_ASAAS_URL || 'https://www.asaas.com/api/v3';
    
    // Implementar chamada para API do Asaas
    // const response = await fetch(`${asaasUrl}/payments`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'access_token': asaasApiKey
    //   },
    //   body: JSON.stringify({
    //     customer: customerId,
    //     billingType: 'CREDIT_CARD',
    //     value: config.amount,
    //     description: config.description,
    //     dueDate: new Date().toISOString().split('T')[0],
    //     callback: {
    //       successUrl: config.returnUrl,
    //       autoRedirect: true
    //     }
    //   })
    // });
    
    return {
      success: false,
      error: 'Integração com gateway não implementada. Configure seu gateway.'
    };
  }
  
  // Exemplo para Stripe:
  if (gatewayName === 'stripe') {
    // Implementar chamada para API do Stripe
    return {
      success: false,
      error: 'Integração com gateway não implementada. Configure seu gateway.'
    };
  }
  
  return {
    success: false,
    error: `Gateway "${gatewayName}" não suportado`
  };
}

/**
 * Verifica o status de uma transação
 */
export async function checkTransactionStatus(transactionId: string, gatewayName: string) {
  try {
    const { data, error } = await (supabase as any)
      .from('payment_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('gateway_name', gatewayName)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, transaction: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lista transações do usuário logado
 */
export async function getUserTransactions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado', transactions: [] };
    }

    const { data, error } = await (supabase as any)
      .from('payment_transactions')
      .select(`
        *,
        courses:course_id (
          id,
          title,
          description,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message, transactions: [] };
    }

    return { success: true, transactions: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, transactions: [] };
  }
}


