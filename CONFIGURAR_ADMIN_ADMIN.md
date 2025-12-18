# Como Tornar admin@gmail.com Administrador

## Opção 1: Criar Conta Admin Diretamente (MAIS FÁCIL) 🎯

1. **Acesse a página de setup:**
   ```
   http://localhost:8080/setup
   ```

2. **Preencha o formulário:**
   - Email: `admin@gmail.com` (já vem preenchido)
   - Nome: Administrador (ou qualquer nome)
   - Senha: Crie uma senha (mínimo 6 caracteres)

3. **Clique em "Criar Conta de Administrador"**

4. **Faça login** com as credenciais criadas

5. **Agora você terá acesso ao painel Admin!**

---

## Opção 2: Via SQL (Se já tem a conta) 📝

Se você já criou a conta `admin@gmail.com`, execute este SQL no Supabase:

1. **Acesse:** https://supabase.com/dashboard
2. **Vá em SQL Editor**
3. **Cole e execute:**

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'admin@gmail.com';
```

4. **Verifique se funcionou:**

```sql
SELECT user_id, email, full_name, is_admin 
FROM public.profiles 
WHERE email = 'admin@gmail.com';
```

Você deve ver `is_admin: true`

5. **Faça logout e login novamente** na aplicação

---

## Verificar se Funcionou ✅

1. **Faça login** com `admin@gmail.com`
2. **Acesse:** `http://localhost:8080/members`
3. **Você deve ver um botão "Admin"** no topo direito (ao lado do sino)
4. **Clique no botão "Admin"** para acessar o painel administrativo

---

## Problemas Comuns

### ❌ "relation public.profiles does not exist"
**Solução:** Execute o arquivo `SETUP_DATABASE.sql` primeiro no Supabase SQL Editor

### ❌ Botão Admin não aparece
**Solução:** 
1. Verifique se `is_admin = true` no banco de dados
2. Faça logout e login novamente
3. Recarregue a página

### ❌ Erro ao criar conta
**Solução:**
1. Verifique se as tabelas existem (execute SETUP_DATABASE.sql)
2. Verifique se o email não está em uso
3. Use outro email temporariamente

---

## Arquivos Criados

- ✅ `TORNAR_ADMIN_ADMIN.sql` - Script SQL para tornar admin
- ✅ Botão Admin na área de membros
- ✅ Página Setup atualizada para criar admin@gmail.com


