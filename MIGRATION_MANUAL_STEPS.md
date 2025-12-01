# 📋 Passos Manuais de Migração - EasyPet

Este documento contém os passos que **DEVEM ser feitos manualmente** no Supabase Dashboard após executar o `MIGRATION_SCHEMA_FIXED.sql`.

---

## ⚠️ IMPORTANTE: Trigger de Autenticação

O trigger `on_auth_user_created` **NÃO pode ser criado via SQL** porque o Supabase não permite criar triggers na tabela `auth.users` diretamente.

### Passo 1: Criar a Função handle_new_user

A função já está no script SQL, mas você precisa verificar se foi criada:

```sql
-- Verificar se a função existe
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```

Se não existir, execute manualmente:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Determinar role baseado em metadata
  user_role := COALESCE(
    (new.raw_user_meta_data->>'user_type')::app_role,
    (new.raw_user_meta_data->>'role')::app_role,
    'client'::app_role
  );

  -- Criar role do usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);

  -- Criar profile do usuário
  INSERT INTO public.profiles (id, full_name, phone, user_code)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    generate_user_code()
  );

  -- Se for pet_shop, criar o estabelecimento
  IF user_role = 'pet_shop' THEN
    INSERT INTO public.pet_shops (
      owner_id, name, address, city, state, phone, email, code
    ) VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'pet_shop_name', 'Meu PetShop'),
      COALESCE(new.raw_user_meta_data->>'pet_shop_address', ''),
      COALESCE(new.raw_user_meta_data->>'pet_shop_city', ''),
      COALESCE(new.raw_user_meta_data->>'pet_shop_state', ''),
      COALESCE(new.raw_user_meta_data->>'phone', ''),
      new.email,
      generate_pet_shop_code()
    );
  END IF;

  RETURN new;
END;
$$;
```

### Passo 2: Criar o Trigger no Dashboard

1. Acesse o Supabase Dashboard do projeto `zxdbsimthnfprrthszoh`
2. Vá para **Database → Triggers**
3. Clique em **Create Trigger** (ou **Create a new trigger**)
4. Configure:

| Campo | Valor |
|-------|-------|
| Name | `on_auth_user_created` |
| Table | `auth.users` |
| Schema | `auth` |
| Events | `INSERT` |
| Trigger Type | `AFTER` |
| Orientation | `ROW` |
| Function | `public.handle_new_user` |

5. Clique em **Create trigger**

**Alternativa via SQL (se o dashboard permitir):**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🔐 Configurar Authentication

### Passo 3: Habilitar Email Provider

1. Vá para **Authentication → Providers**
2. Em **Email**, clique para expandir
3. Habilite **Enable Email provider**
4. **DESABILITE** "Confirm email" (para facilitar testes)
5. Clique **Save**

### Passo 4: Configurar URLs de Redirect

1. Vá para **Authentication → URL Configuration**
2. Em **Site URL**, coloque: `https://[seu-projeto].lovable.app`
3. Em **Redirect URLs**, adicione:
   - `https://[seu-projeto].lovable.app`
   - `https://[seu-projeto].lovable.app/auth`
   - `https://[seu-projeto].lovable.app/auth/callback`
   - `http://localhost:8080` (desenvolvimento)
4. Clique **Save**

### Passo 5: Google OAuth (Opcional)

Se quiser habilitar login com Google:

1. Vá para **Authentication → Providers → Google**
2. Habilite **Enable Google provider**
3. Configure:
   - **Client ID**: (do Google Cloud Console)
   - **Client Secret**: (do Google Cloud Console)
4. Adicione as URLs de redirect no Google Cloud Console

---

## 🔑 Configurar Secrets (Lovable Cloud)

### Passo 6: Adicionar Secrets das Edge Functions

No Lovable Cloud Dashboard, vá para **Settings → Secrets** e adicione:

| Secret | Descrição | Obrigatório |
|--------|-----------|-------------|
| `RESEND_API_KEY` | Chave API do Resend.com | Sim (para emails) |
| `LOOPS_API_KEY` | Chave API do Loops.so | Opcional |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do WhatsApp Business | Opcional |
| `CAKTO_API_KEY` | Chave API do Cakto | Opcional |

---

## ✅ Checklist de Verificação

Execute estas queries no SQL Editor para verificar:

```sql
-- Verificar tabelas criadas
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Esperado: 62+

-- Verificar funções
SELECT COUNT(*) as total_functions 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
-- Esperado: 30+

-- Verificar triggers
SELECT COUNT(*) as total_triggers 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
-- Esperado: 10+

-- Verificar políticas RLS
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public';
-- Esperado: 70+

-- Verificar storage buckets
SELECT id, name, public FROM storage.buckets;
-- Esperado: avatars, backups, pet-photos, documents

-- Verificar função God User
SELECT is_god_user('00000000-0000-0000-0000-000000000000'::uuid);
-- Esperado: false

-- Verificar ENUMs
SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace;
-- Esperado: app_role, app_module, app_action
```

---

## 🧪 Testar Autenticação

### Teste 1: Registro de Usuário Cliente

1. Acesse a aplicação
2. Clique em "Criar conta"
3. Preencha com:
   - Nome: Teste Cliente
   - Email: teste@exemplo.com
   - Senha: Teste@123456
   - Tipo: Cliente
4. Verifique se:
   - Profile foi criado: `SELECT * FROM profiles WHERE full_name = 'Teste Cliente';`
   - Role foi atribuída: `SELECT * FROM user_roles WHERE role = 'client' ORDER BY created_at DESC LIMIT 1;`

### Teste 2: Registro de Pet Shop

1. Faça logout
2. Crie nova conta como "Pet Shop"
3. Verifique se:
   - Pet shop foi criado: `SELECT * FROM pet_shops ORDER BY created_at DESC LIMIT 1;`
   - Código único foi gerado

### Teste 3: God Mode

1. Registre-se com email `beninelixo@gmail.com`
2. Verifique: `SELECT is_god_user(id) FROM auth.users WHERE email = 'beninelixo@gmail.com';`
3. Esperado: `true`

---

## 🚨 Troubleshooting

### Erro: "Trigger on auth.users not allowed"
- Este é esperado! O trigger deve ser criado manualmente via Dashboard (Passo 2)

### Erro: "Permission denied for schema auth"
- Triggers em `auth.users` só podem ser criados via Dashboard

### Erro: "Infinite recursion in policy"
- Não deve ocorrer com este script corrigido
- Se ocorrer, verifique se as funções `has_role` e `is_god_user` usam `SECURITY DEFINER`

### Erro: "Bucket already exists"
- Ignorar - o script usa `ON CONFLICT DO NOTHING`

### Usuário não consegue fazer login
- Verifique se o Email Provider está habilitado
- Verifique se "Confirm email" está desabilitado
- Verifique logs em Authentication → Logs

### Profile não foi criado automaticamente
- O trigger `on_auth_user_created` provavelmente não foi configurado
- Siga o Passo 2 novamente

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Supabase Dashboard → Logs
2. Execute as queries de verificação acima
3. Confirme que o trigger foi criado corretamente

---

*Documento gerado em: 2024-12-01*
*Versão: 2.0 - Corrigida*
