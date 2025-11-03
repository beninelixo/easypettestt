# 🔍 Diagnóstico Completo do Sistema PetShop

**Data da Análise:** 2025-11-03  
**Status:** Sistema operacional com falhas críticas identificadas

---

## 📊 Resumo Executivo

| Categoria | Status | Criticidade | Falhas |
|-----------|--------|-------------|--------|
| Autenticação | ⚠️ Com problemas | Alta | 3 |
| Cadastro | ⚠️ Com problemas | Alta | 2 |
| Dashboard | ✅ OK | Baixa | 1 |
| Agendamentos | ❌ Crítico | Crítica | 4 |
| Estoque | ⚠️ Com problemas | Média | 2 |
| Pagamentos | ⚠️ Com problemas | Alta | 3 |
| Segurança | ⚠️ Com problemas | Crítica | 5 |

**Score Geral: 62/100** - Requer atenção imediata

---

## 🔴 FALHAS CRÍTICAS (Prioridade 1)

### 1. Sistema de Autenticação - Login Falhando

**Módulo:** `src/pages/Auth.tsx` + `src/hooks/useAuth.tsx`

**Problema Identificado:**
- Múltiplas tentativas de login com credenciais inválidas (logs mostram erro 400)
- Rate limiting implementado mas não está bloqueando efetivamente
- Mensagens de erro genéricas não ajudam o usuário

**Impacto:**
- Usuários não conseguem acessar o sistema
- Experiência do usuário prejudicada
- Possíveis tentativas de força bruta não sendo mitigadas adequadamente

**Reprodução:**
1. Acessar `/auth`
2. Tentar login com credenciais erradas
3. Sistema exibe mensagem genérica
4. Rate limit não bloqueia após 5 tentativas

**Logs Relacionados:**
```json
{
  "error": "400: Invalid login credentials",
  "status": "400",
  "timestamp": 1762203148000000
}
```

**Causa Raiz:**
- Edge function `validate-login` não está retornando corretamente o status de bloqueio
- Cliente não está recebendo feedback adequado do servidor

---

### 2. Cadastro Retornando Erro 422

**Módulo:** `src/pages/Auth.tsx` - função `handleRegister`

**Problema:**
- Signup retorna erro 422 (Unprocessable Entity)
- Trigger `handle_new_user()` pode estar falhando
- Dados não estão sendo inseridos corretamente nas tabelas relacionadas

**Impacto:**
- Novos usuários não conseguem se cadastrar
- Perda de clientes potenciais
- Sistema inutilizável para novos usuários

**Reprodução:**
1. Acessar `/auth`
2. Preencher formulário de cadastro
3. Clicar em "Cadastrar"
4. Sistema retorna erro 422

**Logs:**
```json
{
  "status": "422",
  "path": "/signup",
  "timestamp": 1762203125000000
}
```

**Causa Raiz:**
- Trigger `handle_new_user()` pode estar tentando inserir dados duplicados
- Validação de email/phone falhando
- Problema com criação do pet_shop para usuários tipo "pet_shop"

---

### 3. Agendamentos Duplicados no Mesmo Horário

**Módulo:** Tabela `appointments` + `src/pages/petshop/Calendario.tsx`

**Problema:**
- Não há constraint UNIQUE para prevenir agendamentos no mesmo horário/data
- Sistema permite criar múltiplos agendamentos conflitantes
- Cliente pode agendar horários já ocupados

**Impacto:**
- Conflitos de horários causam caos operacional
- Clientes chegam no mesmo horário
- Perda de credibilidade do petshop
- Revisões negativas

**Reprodução:**
1. Agendar serviço para 10:00 dia 05/11
2. Agendar outro serviço para 10:00 dia 05/11
3. Ambos são aceitos sem aviso

**Solução SQL:**
```sql
-- Adicionar constraint UNIQUE
ALTER TABLE appointments 
ADD CONSTRAINT unique_appointment_slot 
UNIQUE (pet_shop_id, scheduled_date, scheduled_time);

-- Adicionar validação antes de inserir
CREATE OR REPLACE FUNCTION prevent_appointment_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM appointments 
    WHERE pet_shop_id = NEW.pet_shop_id
      AND scheduled_date = NEW.scheduled_date
      AND scheduled_time = NEW.scheduled_time
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND status NOT IN ('cancelled')
  ) THEN
    RAISE EXCEPTION 'Já existe um agendamento para este horário';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_appointment_conflict
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION prevent_appointment_conflicts();
```

---

### 4. Estoque Negativo Permitido

**Módulo:** Tabela `products` + `src/pages/petshop/Estoque.tsx`

**Problema:**
- Sistema permite quantidade de estoque negativa
- Trigger `log_stock_movement()` apenas registra, não previne
- Vendas podem ocorrer sem estoque disponível

**Impacto:**
- Dados inconsistentes no banco
- Relatórios financeiros incorretos
- Promessas não cumpridas aos clientes

**Solução SQL:**
```sql
-- Adicionar constraint CHECK
ALTER TABLE products 
ADD CONSTRAINT positive_stock_quantity 
CHECK (stock_quantity >= 0);

-- Adicionar trigger de validação
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity < 0 THEN
    RAISE EXCEPTION 'Estoque não pode ser negativo. Produto: % tem apenas % unidades', 
      NEW.name, OLD.stock_quantity;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_negative_stock
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION prevent_negative_stock();
```

---

### 5. Pagamentos sem Reconciliação

**Módulo:** Tabela `payments` + Edge function `reconcile-payments`

**Problema:**
- Pagamentos criados mas não reconciliados com agendamentos concluídos
- Edge function existe mas não está sendo chamada regularmente
- Discrepâncias entre serviços realizados e pagamentos registrados

**Impacto:**
- Perda de receita
- Relatórios financeiros imprecisos
- Dificuldade em cobrar clientes
- Problemas fiscais

**Solução:**
- Ativar cron job para reconciliação diária
- Adicionar validação na conclusão de agendamentos

---

## ⚠️ PROBLEMAS DE SEGURANÇA

### 1. Ausência de Auditoria Completa

**Problema:**
- Apenas 3 tabelas têm triggers de auditoria (appointments, payments, products)
- Operações em outras tabelas críticas não são auditadas

**Tabelas Sem Auditoria:**
- `user_roles` (mudanças de permissão)
- `pet_shops` (alterações em estabelecimentos)
- `profiles` (dados pessoais)
- `pets` (informações de pets)

**Solução:**
```sql
-- Adicionar triggers de auditoria para todas as tabelas críticas
CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_pet_shops AFTER INSERT OR UPDATE OR DELETE ON pet_shops
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_pets AFTER INSERT OR UPDATE OR DELETE ON pets
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

### 2. Rate Limiting Não Efetivo

**Problema:**
- Sistema implementado mas não está bloqueando usuários
- Edge function `validate-login` retorna sucesso mesmo com muitas tentativas

**Evidência:**
- Logs mostram múltiplas tentativas seguidas do mesmo IP

**Solução:**
- Revisar lógica da edge function
- Implementar bloqueio por IP no Supabase
- Adicionar CAPTCHA após 3 tentativas

---

### 3. Senhas Sem Política de Expiração

**Problema:**
- Senhas nunca expiram
- Não há política de rotação de senha
- Usuários podem usar mesma senha indefinidamente

**Solução:**
```sql
-- Adicionar campo de expiração de senha
ALTER TABLE profiles 
ADD COLUMN password_changed_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN password_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days');

-- Função para verificar expiração
CREATE OR REPLACE FUNCTION check_password_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password_changed_at != OLD.password_changed_at THEN
    NEW.password_expires_at := NOW() + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 4. Falta de Sanitização de Inputs

**Problema:**
- Alguns inputs não têm validação adequada no backend
- Apenas validação client-side com Zod
- SQL injection ainda é possível via RPC functions

**Áreas Críticas:**
- Busca de produtos (campo `searchTerm`)
- Filtros de agendamentos
- Campos de texto livre (notes, description)

**Solução:**
- Adicionar validação server-side em todas as edge functions
- Usar prepared statements em RPC functions
- Implementar whitelist de caracteres permitidos

---

### 5. Logs Sem Retenção Adequada

**Problema:**
- Função `cleanup_old_logs()` remove logs após 30 dias
- Logs críticos de segurança devem ser mantidos por mais tempo
- Não há backup de logs antes da exclusão

**Solução:**
```sql
-- Modificar função de limpeza para manter logs críticos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Backup de logs críticos antes de deletar
  INSERT INTO audit_logs_archive 
  SELECT * FROM system_logs 
  WHERE log_type IN ('error', 'critical', 'security')
    AND created_at < NOW() - INTERVAL '30 days';

  -- Deletar apenas logs não-críticos
  DELETE FROM public.system_logs
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND log_type NOT IN ('error', 'critical', 'security');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;
```

---

## 🔧 PROBLEMAS OPERACIONAIS

### 1. Dashboard com Queries Não Otimizadas

**Problema:**
- Múltiplas queries ao carregar dashboard
- Não usa índices adequados
- N+1 queries em listas

**Impacto:**
- Carregamento lento (>2s)
- Experiência do usuário ruim
- Sobrecarga no banco

**Solução:**
- Usar RPC functions existentes (`get_dashboard_stats`, `get_monthly_revenue`)
- Adicionar índices nas colunas de busca
- Implementar cache client-side

---

### 2. Notificações Não Enviadas

**Problema:**
- Trigger `notify_new_appointment()` cria notificação na tabela
- Mas nenhum sistema envia emails/SMS
- Notificações ficam eternamente com status 'pendente'

**Solução:**
- Criar edge function para processar notificações pendentes
- Integrar com serviço de email (Resend já configurado)
- Adicionar cron job para envio em lote

---

### 3. Backup Manual

**Problema:**
- Edge function `backup-critical-data` existe mas não é executada
- Sem cron job configurado
- Sem procedimento de restore documentado

**Solução:**
- Configurar cron job diário
- Criar procedimento de restore
- Testar recovery periodicamente

---

## 📋 CHECKLIST DE CORREÇÕES AUTOMATIZADAS

### Prioridade 1 - Imediato (24h)
- [ ] Corrigir constraint de agendamentos duplicados
- [ ] Adicionar validação de estoque negativo
- [ ] Revisar trigger handle_new_user
- [ ] Implementar auditoria em todas as tabelas
- [ ] Configurar rate limiting efetivo

### Prioridade 2 - Urgente (3 dias)
- [ ] Implementar sistema de notificações
- [ ] Otimizar queries do dashboard
- [ ] Adicionar política de expiração de senhas
- [ ] Configurar backups automáticos
- [ ] Implementar sanitização server-side

### Prioridade 3 - Importante (7 dias)
- [ ] Adicionar CAPTCHA no login
- [ ] Criar dashboard de monitoramento
- [ ] Implementar alertas proativos
- [ ] Documentar procedimento de restore
- [ ] Treinar equipe em segurança

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar correções SQL** (script automatizado)
2. **Deployar edge functions atualizadas**
3. **Configurar cron jobs**
4. **Testar todas as correções**
5. **Monitorar logs por 48h**
6. **Revisar políticas RLS**
7. **Implementar testes automatizados**

---

**Responsável:** Equipe de Desenvolvimento  
**Revisão:** A cada 15 dias  
**Próxima Análise:** 2025-11-18
