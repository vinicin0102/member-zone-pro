-- Criar tabela para armazenar transações de pagamento
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  gateway_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  payment_method TEXT,
  metadata JSONB,
  webhook_data JSONB,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, gateway_name)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_course_id ON public.payment_transactions(course_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON public.payment_transactions(transaction_id);

-- Habilitar RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Webhook service can insert transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Webhook service can update transactions" ON public.payment_transactions;

-- Criar políticas RLS
CREATE POLICY "Users can view their transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
  FOR SELECT USING (public.is_user_admin());

CREATE POLICY "Webhook service can insert transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Webhook service can update transactions" ON public.payment_transactions
  FOR UPDATE USING (true);

-- Trigger para updated_at (criar função se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions;

-- Criar trigger
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar pagamento confirmado
CREATE OR REPLACE FUNCTION public.process_payment_confirmation(
  p_transaction_id TEXT,
  p_gateway_name TEXT,
  p_status TEXT,
  p_user_email TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_webhook_data JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction RECORD;
  v_user_id UUID;
  v_course_id UUID;
BEGIN
  SELECT * INTO v_transaction
  FROM public.payment_transactions
  WHERE transaction_id = p_transaction_id
    AND gateway_name = p_gateway_name;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction not found'
    );
  END IF;
  
  IF v_transaction.status = 'paid' THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Transaction already processed',
      'transaction_id', v_transaction.id
    );
  END IF;
  
  IF p_status != 'paid' THEN
    UPDATE public.payment_transactions
    SET 
      status = p_status,
      webhook_data = COALESCE(p_webhook_data, webhook_data),
      updated_at = now()
    WHERE id = v_transaction.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Transaction status updated',
      'status', p_status
    );
  END IF;
  
  v_user_id := v_transaction.user_id;
  v_course_id := v_transaction.course_id;
  
  INSERT INTO public.user_course_access (user_id, course_id, granted_by)
  VALUES (v_user_id, v_course_id, NULL)
  ON CONFLICT (user_id, course_id) DO NOTHING;
  
  UPDATE public.payment_transactions
  SET 
    status = 'paid',
    paid_at = now(),
    webhook_data = COALESCE(p_webhook_data, webhook_data),
    updated_at = now()
  WHERE id = v_transaction.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment processed and access granted',
    'user_id', v_user_id,
    'course_id', v_course_id
  );
END;
$$;

