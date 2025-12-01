# 🚀 Guia Completo de Migração - EasyPet

## Visão Geral

Este guia detalha o processo de migração do projeto EasyPet para um novo projeto Supabase (`zxdbsimthnfprrthszoh`).

### O que será migrado:
- ✅ 62+ Tabelas
- ✅ 3 ENUMs customizados (app_role, app_module, app_action)
- ✅ 61 Funções SQL
- ✅ 38 Triggers
- ✅ 76+ Políticas RLS
- ✅ 4 Storage Buckets
- ✅ 69 Edge Functions (auto-deploy)

### O que NÃO será migrado:
- ❌ Dados existentes (começando do zero)
- ❌ Usuários auth.users (precisarão se re-registrar)
- ❌ Arquivos do Storage

---

## 📋 Pré-requisitos

1. Acesso ao Lovable Cloud Dashboard
2. Acesso ao Supabase Dashboard do novo projeto
3. Arquivo `MIGRATION_SCHEMA.sql` (incluído neste projeto)

---

## 🔧 Passo a Passo

### Fase 1: Conectar Novo Projeto no Lovable Cloud

1. Acesse o Lovable Cloud Dashboard
2. Vá para **Settings → Integrations → Lovable Cloud**
3. Se houver um projeto conectado, desconecte-o
4. Conecte ao novo projeto Supabase:
   - **Project ID**: `zxdbsimthnfprrthszoh`
   - **URL**: `https://zxdbsimthnfprrthszoh.supabase.co`
   - **Anon Key**: (obtenha no Supabase Dashboard → Settings → API)

### Fase 2: Executar Scripts SQL no Novo Supabase

1. Acesse o Supabase Dashboard do projeto `zxdbsimthnfprrthszoh`
2. Vá para **SQL Editor**
3. Crie um novo query
4. Cole o conteúdo completo do arquivo `MIGRATION_SCHEMA.sql`
5. Execute o script (pode demorar alguns minutos)
6. Verifique se não há erros no console

**⚠️ IMPORTANTE**: O script é grande e pode demorar 2-5 minutos para executar. Não interrompa o processo.

### Fase 3: Configurar Auth Providers

No Supabase Dashboard:

1. Vá para **Authentication → Providers**
2. **Email Provider**:
   - Habilite "Email provider"
   - **DESABILITE** "Confirm email" (para facilitar testes)
   - Clique "Save"

3. **Google OAuth** (opcional):
   - Habilite "Google provider"
   - Configure Client ID e Secret do Google Cloud Console
   - Adicione URLs de redirect autorizadas

### Fase 4: Configurar URLs de Redirect

No Supabase Dashboard:

1. Vá para **Authentication → URL Configuration**
2. Adicione as seguintes URLs:
   - `https://[seu-projeto].lovable.app`
   - `https://[seu-projeto].lovable.app/auth`
   - `https://[seu-projeto].lovable.app/auth/callback`
   - `http://localhost:8080` (para desenvolvimento local)

### Fase 5: Reconfigurar Secrets das Edge Functions

No Lovable Cloud Dashboard:

1. Vá para **Settings → Secrets**
2. Adicione os seguintes secrets (se necessário):

| Secret | Descrição |
|--------|-----------|
| `RESEND_API_KEY` | Chave da API do Resend para emails |
| `LOOPS_API_KEY` | Chave da API do Loops.so |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número WhatsApp Business |
| `CAKTO_API_KEY` | Chave da API do Cakto (pagamentos) |

### Fase 6: Verificar Edge Functions

As Edge Functions serão automaticamente deployadas quando você conectar o novo projeto. Verifique:

1. No Supabase Dashboard, vá para **Edge Functions**
2. Confirme que todas as funções estão listadas
3. Teste algumas funções críticas:
   - `health-check`
   - `validate-login`
   - `send-reset-code`

---

## ✅ Checklist de Validação Pós-Migração

### Banco de Dados
- [ ] Todas as tabelas criadas (62+)
- [ ] Todas as funções criadas (61)
- [ ] Todos os triggers criados (38)
- [ ] Todas as políticas RLS aplicadas (76+)
- [ ] Storage buckets criados (avatars, backups, pet-photos, documents)

### Autenticação
- [ ] Registro de novo usuário funciona
- [ ] Login com email/senha funciona
- [ ] Profile é criado automaticamente após registro
- [ ] Role é atribuída automaticamente (client/pet_shop)
- [ ] Google OAuth funciona (se configurado)

### Funcionalidades
- [ ] God Mode funciona para `beninelixo@gmail.com`
- [ ] Dashboard admin acessível para admins
- [ ] Dashboard cliente acessível para clientes
- [ ] Dashboard profissional acessível para pet_shop
- [ ] Agendamentos podem ser criados
- [ ] Serviços podem ser cadastrados

### Edge Functions
- [ ] `health-check` retorna status OK
- [ ] `validate-login` funciona
- [ ] `send-reset-code` envia emails
- [ ] Webhooks funcionam

---

## 🔐 Usuário God Mode

O email `beninelixo@gmail.com` é automaticamente reconhecido como God User através da função `is_god_user()`. Este usuário tem acesso total a todos os dados, ignorando políticas RLS.

**Para ativar:**
1. Registre-se com o email `beninelixo@gmail.com`
2. O sistema automaticamente reconhecerá como God User
3. Acesso total ao sistema será concedido

---

## 🚨 Troubleshooting

### Erro: "relation already exists"
O script tenta criar objetos que já existem. Execute no SQL Editor:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Depois execute o MIGRATION_SCHEMA.sql novamente.

### Erro: "permission denied"
Verifique se você está usando a role correta no SQL Editor. Use a role `postgres`.

### Erro: "type does not exist"
Os ENUMs precisam ser criados primeiro. O script já está na ordem correta, mas se houver problemas, execute a seção de ENUMs separadamente primeiro.

### Edge Functions não aparecem
As Edge Functions são deployadas automaticamente pelo Lovable Cloud. Se não aparecerem:
1. Desconecte e reconecte o projeto no Lovable Cloud
2. Aguarde alguns minutos
3. Verifique novamente no Supabase Dashboard

### Login não funciona
1. Verifique se o Email Provider está habilitado
2. Verifique se "Confirm email" está desabilitado
3. Verifique os logs em Authentication → Logs

---

## 📊 Estrutura do Schema

### Tabelas Principais
| Categoria | Tabelas |
|-----------|---------|
| **Core** | profiles, user_roles, pet_shops, pets, services, appointments, payments |
| **Segurança** | login_attempts, blocked_ips, security_alerts, mfa_secrets, audit_logs |
| **Admin** | admin_alerts, admin_invites, admin_notification_preferences |
| **Negócio** | products, stock_movements, commissions, loyalty_points, marketing_campaigns |
| **Multi-tenant** | tenants, franchises, user_hierarchy, brand_standards |
| **Sistema** | system_logs, system_health_metrics, backup_history, failed_jobs |

### Funções Principais
| Função | Descrição |
|--------|-----------|
| `is_god_user()` | Verifica se usuário é God Mode |
| `has_role()` | Verifica role do usuário |
| `has_permission()` | Verifica permissão específica |
| `is_employee_of_petshop()` | Verifica se é funcionário |
| `handle_new_user()` | Trigger para criar profile/role |
| `get_dashboard_stats()` | Estatísticas do dashboard |
| `get_system_health()` | Status de saúde do sistema |

---

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Verifique o console do Supabase para erros específicos
2. Consulte os logs de Auth em Authentication → Logs
3. Verifique os logs de Edge Functions em Edge Functions → Logs

---

## 🎉 Conclusão

Após completar todos os passos:

1. ✅ Novo projeto Supabase configurado
2. ✅ Schema completo migrado
3. ✅ Auth configurado
4. ✅ Edge Functions deployadas
5. ✅ Secrets configurados

O sistema estará pronto para uso! Os usuários precisarão se registrar novamente, pois os dados de auth.users não são migrados.

---

*Documento gerado em: 2024-12-01*
*Versão: 1.0*
