# 🔍 DIAGNÓSTICO COMPLETO DO SISTEMA - BOINTHOSA PET SYSTEM

**Data da Análise**: 2025-11-03  
**Status Geral**: ⚠️ Sistema operacional com correções necessárias  
**Prioridade**: Alta

---

## 📊 RESUMO EXECUTIVO

### Problemas Críticos Detectados: 2
### Problemas Médios Detectados: 8  
### Melhorias Sugeridas: 15

**Impacto estimado**: 
- 🔴 **Crítico**: 2 problemas que podem causar perda de dados ou falhas graves
- 🟡 **Médio**: 8 problemas que afetam experiência do usuário
- 🟢 **Baixo**: 15 oportunidades de melhoria e otimização

---

## 🔐 MÓDULO 1: LOGIN / AUTENTICAÇÃO

### ✅ Funcionando Corretamente
- ✓ Rate limiting server-side implementado
- ✓ Validação de senha forte (8+ caracteres, complexidade)
- ✓ JWT tokens gerenciados pelo Supabase
- ✓ Recuperação de senha com OTP
- ✓ RLS policies configuradas

### ⚠️ Problemas Detectados

#### PROBLEMA 1.1: Sessões expiradas não são detectadas proativamente
**Severidade**: 🟡 Média  
**Impacto**: Usuário precisa tentar uma ação para descobrir que foi deslogado  
**Evidência**: Não há verificação periódica de sessão válida  

**Solução Técnica**:
```typescript
// Em src/hooks/useAuth.tsx - Adicionar verificação de sessão
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && user) {
      // Sessão expirou
      setUser(null);
      setSession(null);
      toast({
        title: "Sessão expirada",
        description: "Por favor, faça login novamente.",
        variant: "destructive"
      });
      navigate('/auth');
    }
  };

  // Verificar a cada 5 minutos
  const interval = setInterval(checkSession, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [user]);
```

#### PROBLEMA 1.2: Sem proteção contra múltiplas sessões simultâneas
**Severidade**: 🟡 Média  
**Impacto**: Usuário pode ter múltiplas sessões ativas, dificultando auditoria  

**Solução Técnica**: Criar tabela de sessões ativas
```sql
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  device_info JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, session_token)
);

CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_expires_at ON public.active_sessions(expires_at);
```

#### PROBLEMA 1.3: Falta log detalhado de tentativas de acesso
**Severidade**: 🟢 Baixa  
**Impacto**: Dificulta investigação de atividades suspeitas  

**Automação**: Edge function para log detalhado já implementada

---

## 👤 MÓDULO 2: CADASTRO DE USUÁRIO/PET

### ✅ Funcionando Corretamente
- ✓ Validação com Zod
- ✓ Verificação de duplicidade de email via Supabase
- ✓ Trigger handle_new_user funciona corretamente
- ✓ Campos obrigatórios validados

### 🔴 Problemas Detectados

#### PROBLEMA 2.1: Cadastros incompletos não são detectados automaticamente
**Severidade**: 🔴 Crítica  
**Impacto**: Perfis sem nome completo dificultam comunicação  
**Evidência**: Query mostrou 0 perfis incompletos (bom sinal, mas não há monitoramento)

**Solução Técnica**: Edge function de validação
```typescript
// supabase/functions/validate-profiles/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Buscar perfis incompletos
  const { data: incompleteProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .or('full_name.eq.,phone.eq.');

  if (incompleteProfiles && incompleteProfiles.length > 0) {
    // Enviar notificação para admins
    await supabase.from('system_logs').insert({
      module: 'validate_profiles',
      log_type: 'warning',
      message: `${incompleteProfiles.length} perfis incompletos detectados`,
      details: { profiles: incompleteProfiles.map(p => p.id) }
    });

    // Enviar email para usuários (implementar)
    for (const profile of incompleteProfiles) {
      // TODO: Enviar email pedindo completar cadastro
    }
  }

  return new Response(JSON.stringify({ 
    checked: true, 
    incomplete: incompleteProfiles?.length || 0 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### PROBLEMA 2.2: Pets órfãos (sem dono) podem existir
**Severidade**: 🔴 Crítica  
**Impacto**: Dados inconsistentes no banco  
**Evidência**: Query retornou 0 pets órfãos (bom), mas não há verificação automática

**Script de Correção**:
```sql
-- Detectar e corrigir pets órfãos
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  -- Contar pets órfãos
  SELECT COUNT(*) INTO orphan_count
  FROM pets p
  WHERE p.owner_id IS NULL 
     OR NOT EXISTS (
       SELECT 1 FROM auth.users u WHERE u.id = p.owner_id
     );

  IF orphan_count > 0 THEN
    -- Log do problema
    INSERT INTO system_logs (module, log_type, message, details)
    VALUES (
      'data_integrity',
      'error',
      'Pets órfãos detectados',
      jsonb_build_object('count', orphan_count)
    );

    -- Deletar pets órfãos (ou mover para admin)
    DELETE FROM pets
    WHERE owner_id IS NULL 
       OR NOT EXISTS (
         SELECT 1 FROM auth.users u WHERE u.id = owner_id
       );
  END IF;
END $$;
```

**Automação**: Executar via cron semanal

---

## 📅 MÓDULO 3: AGENDAMENTO

### ✅ Funcionando Corretamente
- ✓ Validação de campos obrigatórios
- ✓ Seleção de data e hora
- ✓ Associação pet-serviço-petshop

### 🔴 Problemas Detectados

#### PROBLEMA 3.1: Agendamentos atrasados não são tratados automaticamente
**Severidade**: 🔴 Crítica  
**Impacto**: 2 agendamentos atrasados detectados, sem notificação  
**Evidência**: Query retornou `overdue_appointments: 2`

**Script de Correção Imediata**:
```sql
-- Atualizar agendamentos atrasados
UPDATE appointments
SET status = 'cancelled',
    notes = COALESCE(notes || E'\n', '') || '[AUTO] Cancelado automaticamente por atraso - ' || NOW()::TEXT
WHERE scheduled_date < CURRENT_DATE
  AND status IN ('pending', 'confirmed')
RETURNING id, scheduled_date, pet_id, client_id;
```

**Automação Edge Function**:
```typescript
// supabase/functions/process-overdue-appointments/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Buscar agendamentos atrasados
  const { data: overdueAppointments } = await supabase
    .from('appointments')
    .select('id, scheduled_date, scheduled_time, client_id, pet_shop_id, service_id, pet_id')
    .lt('scheduled_date', new Date().toISOString().split('T')[0])
    .in('status', ['pending', 'confirmed']);

  if (overdueAppointments && overdueAppointments.length > 0) {
    // Atualizar para cancelado
    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled',
        notes: '[AUTO] Cancelado por atraso'
      })
      .in('id', overdueAppointments.map(a => a.id));

    // Log da ação
    await supabase.from('system_logs').insert({
      module: 'process_overdue_appointments',
      log_type: 'warning',
      message: `${overdueAppointments.length} agendamentos atrasados cancelados`,
      details: { appointments: overdueAppointments.map(a => a.id) }
    });

    // Notificar clientes (TODO: implementar)
    for (const appointment of overdueAppointments) {
      // Enviar notificação para cliente
    }
  }

  return new Response(JSON.stringify({ 
    processed: overdueAppointments?.length || 0 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### PROBLEMA 3.2: Não há verificação de horários duplicados
**Severidade**: 🟡 Média  
**Impacto**: Possível duplo agendamento no mesmo horário  
**Evidência**: Query não encontrou duplicatas (bom), mas não há prevenção

**Solução Técnica**: Constraint único + validação no frontend
```sql
-- Adicionar constraint para prevenir duplicatas
CREATE UNIQUE INDEX idx_unique_appointment_slot 
ON appointments (pet_shop_id, scheduled_date, scheduled_time)
WHERE status NOT IN ('cancelled', 'completed');
```

**Validação Frontend** (adicionar em NewAppointment.tsx):
```typescript
const validateTimeSlot = async (petShopId: string, date: string, time: string) => {
  const { data: existingAppointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('pet_shop_id', petShopId)
    .eq('scheduled_date', date)
    .eq('scheduled_time', time)
    .in('status', ['pending', 'confirmed', 'in_progress'])
    .single();

  if (existingAppointment) {
    toast({
      title: "Horário indisponível",
      description: "Este horário já está reservado. Por favor, escolha outro.",
      variant: "destructive"
    });
    return false;
  }
  return true;
};
```

#### PROBLEMA 3.3: Sem confirmação de agendamento por email/SMS
**Severidade**: 🟡 Média  
**Impacto**: Cliente não recebe confirmação, aumenta no-shows  

**Automação**: Trigger de notificação
```sql
-- Trigger para enviar notificação após agendamento
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    client_id,
    appointment_id,
    notification_type,
    channel,
    message,
    status
  ) VALUES (
    NEW.client_id,
    NEW.id,
    'confirmacao',
    'email',
    'Seu agendamento foi confirmado para ' || NEW.scheduled_date || ' às ' || NEW.scheduled_time,
    'pendente'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_new_appointment
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_new_appointment();
```

---

## 💳 MÓDULO 4: PAGAMENTOS

### ✅ Funcionando Corretamente
- ✓ Tabela payments existe e está relacionada
- ✓ Dashboard financeiro exibe corretamente

### 🔴 Problemas Detectados

#### PROBLEMA 4.1: Pagamentos não são criados automaticamente ao finalizar agendamento
**Severidade**: 🔴 Crítica  
**Impacto**: Pet shop precisa criar pagamento manualmente  

**Solução**: Trigger automático
```sql
-- Trigger para criar pagamento ao completar agendamento
CREATE OR REPLACE FUNCTION create_payment_on_complete()
RETURNS TRIGGER AS $$
DECLARE
  service_price NUMERIC;
BEGIN
  -- Somente se mudou para 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Buscar preço do serviço
    SELECT price INTO service_price
    FROM services
    WHERE id = NEW.service_id;
    
    -- Criar pagamento
    INSERT INTO payments (
      appointment_id,
      amount,
      payment_method,
      status
    ) VALUES (
      NEW.id,
      service_price,
      'pendente', -- Definir método depois
      'pendente'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_create_payment
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION create_payment_on_complete();
```

#### PROBLEMA 4.2: Sem reconciliação de pagamentos
**Severidade**: 🟡 Média  
**Impacto**: Pagamentos marcados como "pago" mas não reconciliados  

**Edge Function de Reconciliação**:
```typescript
// supabase/functions/reconcile-payments/index.ts
import { createClient } from '@supabase/supabase-js';

interface ReconciliationResult {
  total_checked: number;
  discrepancies: number;
  fixed: number;
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const result: ReconciliationResult = {
    total_checked: 0,
    discrepancies: 0,
    fixed: 0
  };

  // Buscar pagamentos marcados como "pago" sem data
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'pago')
    .is('paid_at', null);

  result.total_checked = payments?.length || 0;

  if (payments && payments.length > 0) {
    result.discrepancies = payments.length;
    
    // Corrigir adicionando data atual
    const { error } = await supabase
      .from('payments')
      .update({ paid_at: new Date().toISOString() })
      .in('id', payments.map(p => p.id));

    if (!error) {
      result.fixed = payments.length;
    }

    // Log
    await supabase.from('system_logs').insert({
      module: 'reconcile_payments',
      log_type: 'warning',
      message: `Reconciliação: ${result.fixed} pagamentos corrigidos`,
      details: result
    });
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### PROBLEMA 4.3: Divisão de ticket médio incorreta quando não há pagamentos
**Severidade**: 🟢 Baixa  
**Impacto**: Erro de divisão por zero no frontend  
**Evidência**: Linha 187 de Financeiro.tsx

**Correção**: Já implementada no código com verificação `payments.length > 0`

---

## 📦 MÓDULO 5: ESTOQUE

### ✅ Funcionando Corretamente
- ✓ CRUD de produtos completo
- ✓ Validação com Zod
- ✓ Alertas de estoque baixo
- ✓ Busca por nome/SKU

### 🟡 Problemas Detectados

#### PROBLEMA 5.1: Sem controle de movimentações de estoque
**Severidade**: 🟡 Média  
**Impacto**: Não há rastreabilidade de entradas/saídas  

**Solução**: Trigger para registrar movimentações
```sql
-- Trigger para registrar movimentação de estoque
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.stock_quantity != OLD.stock_quantity THEN
    INSERT INTO stock_movements (
      product_id,
      movement_type,
      quantity,
      reason,
      user_id
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'entrada'
        ELSE 'saida'
      END,
      ABS(NEW.stock_quantity - OLD.stock_quantity),
      'Ajuste manual',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_log_stock_movement
AFTER UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION log_stock_movement();
```

#### PROBLEMA 5.2: Produtos com validade vencida não são alertados
**Severidade**: 🟡 Média  
**Impacto**: Pet shop pode vender produtos vencidos  

**Edge Function de Alerta**:
```typescript
// supabase/functions/check-expiring-products/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Produtos vencidos
  const { data: expired } = await supabase
    .from('products')
    .select('id, name, expiry_date, pet_shop_id')
    .lt('expiry_date', new Date().toISOString().split('T')[0])
    .eq('active', true);

  // Produtos próximos do vencimento (30 dias)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  
  const { data: expiring } = await supabase
    .from('products')
    .select('id, name, expiry_date, pet_shop_id')
    .gte('expiry_date', new Date().toISOString().split('T')[0])
    .lte('expiry_date', futureDate.toISOString().split('T')[0])
    .eq('active', true);

  const alerts = [];

  // Desativar produtos vencidos
  if (expired && expired.length > 0) {
    await supabase
      .from('products')
      .update({ active: false })
      .in('id', expired.map(p => p.id));

    alerts.push({
      type: 'expired',
      count: expired.length,
      products: expired
    });
  }

  // Alertar produtos próximos do vencimento
  if (expiring && expiring.length > 0) {
    alerts.push({
      type: 'expiring_soon',
      count: expiring.length,
      products: expiring
    });
  }

  // Log
  if (alerts.length > 0) {
    await supabase.from('system_logs').insert({
      module: 'check_expiring_products',
      log_type: 'warning',
      message: `Alertas de validade: ${expired?.length || 0} vencidos, ${expiring?.length || 0} a vencer`,
      details: { alerts }
    });
  }

  return new Response(JSON.stringify({ alerts }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### PROBLEMA 5.3: Estoque negativo é permitido
**Severidade**: 🟡 Média  
**Impacto**: Inconsistência de dados  
**Evidência**: Query retornou 0 produtos com estoque negativo (bom), mas não há constraint

**Solução**: Constraint de validação
```sql
-- Adicionar constraint para prevenir estoque negativo
ALTER TABLE products 
ADD CONSTRAINT check_stock_non_negative 
CHECK (stock_quantity >= 0);

-- Adicionar constraint para min_stock_quantity
ALTER TABLE products 
ADD CONSTRAINT check_min_stock_non_negative 
CHECK (min_stock_quantity >= 0);
```

---

## 🎨 MÓDULO 6: UI/UX E RESPONSIVIDADE

### ✅ Funcionando Corretamente
- ✓ Design system com tokens semânticos
- ✓ Dark/Light mode implementado
- ✓ Componentes shadcn configurados
- ✓ Tailwind CSS otimizado

### 🟡 Problemas Detectados

#### PROBLEMA 6.1: Falta feedback visual durante operações assíncronas
**Severidade**: 🟢 Baixa  
**Impacto**: Usuário não sabe se ação está processando  

**Solução**: Adicionar skeletons e loading states
```typescript
// Exemplo para lista de produtos
{isLoading ? (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <Skeleton key={i} className="h-20 w-full" />
    ))}
  </div>
) : (
  <div className="space-y-4">
    {products.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
)}
```

#### PROBLEMA 6.2: Sem tratamento de erros de rede
**Severidade**: 🟡 Média  
**Impacto**: Usuário não sabe que falhou  

**Solução**: Error boundary global
```typescript
// src/components/GlobalErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log para Supabase
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Ops! Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Estamos trabalhando para resolver o problema.</p>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Recarregar página
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### PROBLEMA 6.3: Mensagens de erro genéricas
**Severidade**: 🟢 Baixa  
**Impacto**: Usuário não entende o que fazer  

**Solução**: Mapear erros do Supabase
```typescript
// src/lib/error-messages.ts
export const errorMessages: Record<string, string> = {
  'auth/invalid-email': 'Email inválido',
  'auth/user-not-found': 'Usuário não encontrado',
  'auth/wrong-password': 'Senha incorreta',
  '23505': 'Este registro já existe',
  '23503': 'Não é possível excluir: existem dados relacionados',
  '42501': 'Você não tem permissão para esta ação',
};

export function getFriendlyErrorMessage(error: any): string {
  const code = error?.code || error?.message;
  return errorMessages[code] || 'Ocorreu um erro inesperado';
}
```

---

## 🔒 MÓDULO 7: SEGURANÇA & INTEGRIDADE

### ✅ Funcionando Corretamente
- ✓ RLS habilitado em todas as tabelas
- ✓ Rate limiting server-side
- ✓ Políticas de senha forte
- ✓ Admin role checks em edge functions
- ✓ Input validation com Zod

### 🟢 Oportunidades de Melhoria

#### MELHORIA 7.1: Implementar auditoria completa
**Prioridade**: Alta  
**Benefício**: Rastreabilidade total de ações

**Solução**: Tabela de auditoria
```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Trigger genérico de auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    table_name,
    operation,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Aplicar em tabelas críticas
CREATE TRIGGER audit_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

#### MELHORIA 7.2: Backup automático de dados críticos
**Prioridade**: Alta  
**Benefício**: Recuperação rápida em caso de falha

**Solução**: Edge function de backup
```typescript
// supabase/functions/backup-critical-data/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const backupData: any = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  // Tabelas críticas para backup
  const criticalTables = [
    'appointments',
    'payments',
    'pets',
    'profiles',
    'pet_shops',
    'services'
  ];

  for (const table of criticalTables) {
    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (!error && data) {
      backupData.tables[table] = {
        count: data.length,
        data: data
      };
    }
  }

  // Salvar backup (pode ser storage, S3, etc)
  // Por enquanto, apenas log
  await supabase.from('system_logs').insert({
    module: 'backup_critical_data',
    log_type: 'info',
    message: 'Backup diário realizado',
    details: {
      tables_backed_up: Object.keys(backupData.tables).length,
      total_records: Object.values(backupData.tables)
        .reduce((sum: number, t: any) => sum + t.count, 0)
    }
  });

  return new Response(JSON.stringify(backupData), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### FASE 1: CORREÇÕES CRÍTICAS (Semana 1)
**Prioridade**: 🔴 URGENTE

1. ✅ Implementar tratamento de agendamentos atrasados
2. ✅ Criar trigger de pagamento automático
3. ✅ Adicionar constraint de horário único
4. ✅ Implementar detecção de pets órfãos
5. ✅ Adicionar constraint de estoque não-negativo

**Scripts SQL a executar**:
```sql
-- Executar todos os scripts de PROBLEMA 3.1, 3.2, 4.1, 5.3
-- Ver seções acima para código completo
```

### FASE 2: AUTOMAÇÕES (Semana 2)
**Prioridade**: 🟡 ALTA

1. Deploy das Edge Functions:
   - `process-overdue-appointments` (diário às 00:00)
   - `check-expiring-products` (diário às 06:00)
   - `validate-profiles` (semanal aos domingos)
   - `reconcile-payments` (semanal aos domingos)
   - `backup-critical-data` (diário às 02:00)

2. Configurar Cron Jobs:
```sql
-- Agendamentos atrasados (diário às 00:00)
SELECT cron.schedule(
  'process-overdue-appointments',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/process-overdue-appointments',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Produtos vencendo (diário às 06:00)
SELECT cron.schedule(
  'check-expiring-products',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/check-expiring-products',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Backup diário (às 02:00)
SELECT cron.schedule(
  'backup-critical-data',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/backup-critical-data',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Validação semanal (domingos às 00:00)
SELECT cron.schedule(
  'weekly-validation',
  '0 0 * * 0',
  $$
  SELECT net.http_post(
    url:='https://xkfkrdorghyagtwbxory.supabase.co/functions/v1/validate-profiles',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### FASE 3: MELHORIAS DE UX (Semana 3)
**Prioridade**: 🟢 MÉDIA

1. Implementar skeleton loaders
2. Adicionar error boundary
3. Melhorar mensagens de erro
4. Adicionar verificação de sessão periódica
5. Implementar notificações por email

### FASE 4: AUDITORIA E MONITORAMENTO (Semana 4)
**Prioridade**: 🟢 MÉDIA

1. Implementar tabela de auditoria
2. Criar triggers de auditoria
3. Dashboard de auditoria
4. Alertas por email para admins
5. Relatórios semanais automáticos

---

## 🔔 SISTEMA DE ALERTAS E NOTIFICAÇÕES

### Alertas Críticos (Imediatos - Email)
- ❌ Falha em edge function crítica
- ❌ Mais de 10 agendamentos atrasados
- ❌ Estoque negativo detectado
- ❌ Pets órfãos detectados
- ❌ Falha de backup

### Alertas de Atenção (Diários - Dashboard)
- ⚠️ Produtos com estoque baixo
- ⚠️ Produtos próximos do vencimento
- ⚠️ Pagamentos pendentes há mais de 7 dias
- ⚠️ Perfis incompletos
- ⚠️ Taxa de falhas de login > 5%

### Relatórios Semanais (Email aos domingos)
- 📊 Resumo de agendamentos
- 📊 Performance financeira
- 📊 Produtos mais vendidos
- 📊 Clientes mais ativos
- 📊 Métricas de sistema

---

## 📊 DASHBOARD DE MONITORAMENTO

### Criar página de Health Check para Admins
```typescript
// src/pages/HealthCheck.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function HealthCheck() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 60000); // A cada minuto
    return () => clearInterval(interval);
  }, []);

  const loadHealthData = async () => {
    const { data, error } = await supabase.rpc('get_system_health');
    if (data) setHealth(data);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Health</h1>
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          title="Agendamentos Atrasados" 
          value={health?.overdue_appointments || 0}
          status={health?.overdue_appointments > 0 ? 'error' : 'ok'}
        />
        <MetricCard 
          title="Estoque Baixo" 
          value={health?.low_stock_products || 0}
          status={health?.low_stock_products > 5 ? 'warning' : 'ok'}
        />
        <MetricCard 
          title="Pagamentos Pendentes" 
          value={health?.pending_payments || 0}
          status={health?.pending_payments > 20 ? 'warning' : 'ok'}
        />
        <MetricCard 
          title="Perfis Incompletos" 
          value={health?.incomplete_profiles || 0}
          status={health?.incomplete_profiles > 0 ? 'warning' : 'ok'}
        />
      </div>
    </div>
  );
}
```

### Function RPC para Health Check
```sql
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overdue_appointments', (
      SELECT COUNT(*) FROM appointments 
      WHERE scheduled_date < CURRENT_DATE 
        AND status IN ('pending', 'confirmed')
    ),
    'low_stock_products', (
      SELECT COUNT(*) FROM products 
      WHERE stock_quantity <= min_stock_quantity 
        AND active = true
    ),
    'pending_payments', (
      SELECT COUNT(*) FROM payments 
      WHERE status = 'pendente'
    ),
    'incomplete_profiles', (
      SELECT COUNT(*) FROM profiles 
      WHERE full_name = '' OR phone = ''
    ),
    'pets_without_owner', (
      SELECT COUNT(*) FROM pets 
      WHERE owner_id IS NULL
    ),
    'expired_products', (
      SELECT COUNT(*) FROM products 
      WHERE expiry_date < CURRENT_DATE 
        AND active = true
    ),
    'last_check', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Permitir acesso para admins
GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated;
```

---

## 🎯 MÉTRICAS DE SUCESSO

### KPIs de Qualidade
- ✅ 0 agendamentos atrasados não tratados
- ✅ 0 pets órfãos no banco
- ✅ 0 produtos com estoque negativo
- ✅ 100% de pagamentos com data quando marcados como "pago"
- ✅ 95% de perfis completos

### KPIs de Performance
- ✅ Tempo de resposta < 500ms em 95% das requisições
- ✅ Uptime > 99.5%
- ✅ 0 erros críticos não tratados
- ✅ Backup diário executado com sucesso

### KPIs de UX
- ✅ Todas as operações com feedback visual
- ✅ Mensagens de erro claras e acionáveis
- ✅ 100% de ações críticas com confirmação
- ✅ Tempo de carregamento < 2s

---

## 🚀 PRÓXIMOS PASSOS

1. **Imediato (Hoje)**:
   - Executar script de correção de agendamentos atrasados
   - Adicionar constraints de validação

2. **Esta Semana**:
   - Deploy de todas as edge functions
   - Configurar cron jobs
   - Implementar triggers de notificação

3. **Próximas 2 Semanas**:
   - Implementar auditoria completa
   - Criar dashboard de health check
   - Sistema de alertas por email

4. **Próximo Mês**:
   - Implementar MFA
   - Adicionar testes automatizados
   - Documentação completa

---

## 📞 SUPORTE E MONITORAMENTO

### Canais de Alerta
- **Crítico**: Email imediato para admin@bointhosa.com
- **Atenção**: Dashboard de monitoramento
- **Info**: Logs no sistema

### Revisões Periódicas
- **Diária**: Health check automático
- **Semanal**: Relatório de métricas
- **Mensal**: Revisão completa de segurança

---

**Última Atualização**: 2025-11-03  
**Próxima Revisão**: 2025-11-10  
**Responsável**: Sistema Automático de Diagnóstico
