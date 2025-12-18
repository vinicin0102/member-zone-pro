-- Adicionar campos de configuração de pagamento na tabela site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS payment_gateway_name TEXT DEFAULT 'asaas',
ADD COLUMN IF NOT EXISTS payment_gateway_api_key TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway_secret TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway_webhook_secret TEXT,
ADD COLUMN IF NOT EXISTS payment_webhook_url TEXT;


