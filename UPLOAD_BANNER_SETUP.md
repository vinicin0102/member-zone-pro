# Configuração de Upload de Banner

## ✅ O que foi implementado:

- Upload de arquivo de imagem para o banner
- Preview da imagem antes de salvar
- Validação de tipo de arquivo (apenas imagens)
- Validação de tamanho (máx 5MB)
- Opção alternativa de usar URL
- Preview da imagem atual salva

## 📋 Passo a Passo para Configurar:

### 1. Criar o Bucket no Supabase

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"Storage"**
4. Clique em **"New bucket"** ou **"Create bucket"**
5. Configure:
   - **Nome:** `banners`
   - **Public bucket:** ✅ Marque esta opção (MUITO IMPORTANTE!)
   - Clique em **"Create bucket"**

### 2. Configurar Políticas RLS (Opcional mas Recomendado)

Execute o arquivo `CREATE_BANNER_STORAGE_BUCKET.sql` no Supabase SQL Editor.

Isso vai permitir:
- ✅ Qualquer pessoa pode ver as imagens (público)
- ✅ Apenas admins podem fazer upload
- ✅ Apenas admins podem atualizar/deletar

### 3. Usar no Admin Panel

1. Acesse `/admin`
2. Vá na aba **"Banner"**
3. Clique em **"Escolher Arquivo"**
4. Selecione uma imagem (JPG, PNG, GIF, WebP - máx 5MB)
5. Veja o preview
6. Clique em **"Salvar Banner"**

## 🔄 Como Funciona:

1. **Upload**: A imagem é enviada para o Supabase Storage no bucket `banners`
2. **URL Pública**: O sistema gera uma URL pública da imagem
3. **Salvamento**: A URL é salva na tabela `site_settings`
4. **Display**: A área de membros carrega a imagem da URL salva

## 📝 Notas:

- Se você já tinha uma URL salva, ela continuará funcionando
- Você pode trocar entre upload de arquivo e URL
- A imagem atual é sempre mostrada no preview
- Imagens muito grandes (>5MB) serão rejeitadas

## ⚠️ Troubleshooting:

**Erro: "Bucket not found"**
- Verifique se o bucket foi criado com o nome exato: `banners`
- Verifique se está marcado como público

**Imagem não aparece após upload**
- Verifique se o bucket está marcado como público
- Verifique as políticas RLS no arquivo SQL

**Erro ao fazer upload**
- Verifique o tamanho do arquivo (máx 5MB)
- Verifique o formato (apenas imagens)
- Verifique sua conexão com a internet


