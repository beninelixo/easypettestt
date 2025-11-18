# 📚 Documentação Completa do Sistema EasyPet Enterprise

## 🎯 Visão Geral

O **EasyPet Enterprise** é uma plataforma ERP/BI completa para gestão de Pet Shops, Clínicas Veterinárias e serviços de Banho & Tosa, com suporte total a:

- 🏢 **Multi-franquias** - Gestão de múltiplas franquias
- 🏪 **Multi-lojas** - Gestão de múltiplas unidades
- 👥 **Multi-usuários** - Sistema completo de permissões (RBAC)
- 🔒 **Segurança LGPD** - Isolamento total de dados
- 🤖 **Auto-Healing** - Autocorreção automática 24/7
- 📊 **BI Avançado** - Dashboards e relatórios consolidados
- 🔍 **Auditoria Total** - Logs e monitoramento completo

## 📋 Índice

1. [Arquitetura do Sistema](#arquitetura)
2. [Sistema de Permissões (RBAC)](#rbac)
3. [Multi-Unidades e Franquias](#multi-unidades)
4. [Sistema de Monitoramento](#monitoramento)
5. [Auto-Healing e Auto-Debug](#auto-healing)
6. [Banco de Dados](#banco-de-dados)
7. [Frontend (React)](#frontend)
8. [Hooks Customizados](#hooks)
9. [Componentes UI](#componentes)
10. [Segurança e Compliance](#seguranca)
11. [Guia de Uso](#guia-de-uso)
12. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitetura do Sistema {#arquitetura}

### Estrutura Hierárquica

```
Sistema EasyPet
│
├─ Tenants (Grupos Empresariais)
│  └─ Franchises (Franquias)
│     └─ Units (Unidades/Pet Shops)
│        ├─ Employees (Funcionários com permissões)
│        ├─ Services (Serviços oferecidos)
│        ├─ Appointments (Agendamentos)
│        ├─ Clients (Tutores)
│        └─ Pets (Animais de estimação)
│
├─ Sistema de Permissões (RBAC)
│  ├─ Roles (Papéis)
│  ├─ Permissions (Permissões granulares)
│  └─ Access Audit (Auditoria de acesso)
│
├─ Sistema de Monitoramento
│  ├─ Watchers (Monitoramento 24/7)
│  ├─ Triggers (Eventos inteligentes)
│  ├─ Logs (Auditoria completa)
│  └─ Auto-Debug (Correção automática)
│
└─ Frontend (React + TypeScript)
   ├─ Contexts (TenantContext)
   ├─ Hooks (useMultiUnit, usePermission, etc)
   ├─ Components (UI reutilizáveis)
   └─ Pages (Dashboards, Gestão, etc)
```

### Tecnologias Principais

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Query, Context API
- **UI Components**: Shadcn/ui, Radix UI
- **Build**: Vite

---

## 🔐 Sistema de Permissões (RBAC) {#rbac}

### Estrutura de Roles

```typescript
type AppRole = 
  | 'admin'           // Acesso total ao sistema
  | 'tenant_admin'    // Gestão do tenant
  | 'franchise_owner' // Gestão da franquia
  | 'unit_manager'    // Gestão da unidade
  | 'employee';       // Funcionário (permissões limitadas)
```

### Módulos e Ações

```typescript
// Módulos disponíveis
type AppModule = 
  | 'dashboard' | 'appointments' | 'clients' 
  | 'pets' | 'services' | 'inventory' 
  | 'financial' | 'employees' | 'reports'
  | 'marketing' | 'loyalty' | 'settings';

// Ações disponíveis
type AppAction = 
  | 'view' | 'create' | 'update' 
  | 'delete' | 'manage';
```

### Tabelas de Permissões

#### permissions
```sql
id              uuid PRIMARY KEY
module          app_module NOT NULL
action          app_action NOT NULL
name            text NOT NULL
description     text
created_at      timestamp DEFAULT now()
```

#### employee_permissions
```sql
id              uuid PRIMARY KEY
employee_id     uuid NOT NULL (FK -> petshop_employees)
permission_id   uuid NOT NULL (FK -> permissions)
granted_by      uuid NOT NULL (FK -> auth.users)
granted_at      timestamp DEFAULT now()
```

#### access_audit
```sql
id              uuid PRIMARY KEY
user_id         uuid NOT NULL
pet_shop_id     uuid
module          app_module NOT NULL
action          app_action NOT NULL
resource_id     uuid
resource_type   text
success         boolean DEFAULT true
metadata        jsonb DEFAULT '{}'
ip_address      text
user_agent      text
created_at      timestamp DEFAULT now()
```

### Funções SQL de Permissão

```sql
-- Verificar se usuário tem permissão
CREATE FUNCTION has_permission(
  _user_id UUID,
  _pet_shop_id UUID,
  _module app_module,
  _action app_action
) RETURNS BOOLEAN;

-- Obter permissões do funcionário
CREATE FUNCTION get_employee_permissions(_user_id UUID)
RETURNS TABLE (
  module app_module,
  action app_action,
  permission_name text
);

-- Registrar acesso para auditoria
CREATE FUNCTION log_access(
  _user_id UUID,
  _pet_shop_id UUID,
  _module app_module,
  _action app_action,
  _resource_id UUID,
  _resource_type TEXT,
  _success BOOLEAN,
  _metadata JSONB
) RETURNS VOID;
```

### Hooks de Permissões

```typescript
// Verificar permissão específica
const { hasPermission, loading } = usePermission(
  petShopId,
  'financial',
  'view'
);

// Gerenciar permissões de funcionário
const { 
  permissions,
  loading,
  loadPermissions,
  updatePermissions 
} = useEmployeePermissions(employeeId);

// Carregar logs de auditoria
const { 
  logs,
  loading,
  loadLogs,
  exportLogs 
} = useAccessAudit(petShopId);
```

### Componentes de Proteção

```tsx
// Proteger componente com permissão
<PermissionGuard
  petShopId={currentUnit?.id}
  module="financial"
  action="view"
  showError={true}
>
  <FinancialDashboard />
</PermissionGuard>

// Gerenciar permissões de funcionário
<EmployeePermissionsManager 
  employeeId={employee.id}
  petShopId={petShop.id}
/>

// Visualizar logs de auditoria
<AccessAuditViewer petShopId={petShop.id} />
```

---

## 🏢 Multi-Unidades e Franquias {#multi-unidades}

### TenantContext

O **TenantContext** gerencia todo o contexto multi-tenant:

```typescript
interface TenantContextType {
  tenantId: string | null;
  franchiseId: string | null;
  unitId: string | null;
  userRole: string | null;
  permissions: string[];
  user: User | null;
  loading: boolean;
  switchContext: (
    tenantId?: string, 
    franchiseId?: string, 
    unitId?: string
  ) => void;
  can: (permission: string) => boolean;
}

// Uso
const { tenantId, unitId, can } = useTenant();
```

### useMultiUnit Hook

```typescript
const {
  currentUnit,    // Unidade atual
  franchises,     // Lista de franquias
  switchUnit,     // Alternar unidade
  loading,
  error
} = useMultiUnit();

// Alternar para outra unidade
switchUnit('unit-id-123');
```

### UnitSwitcher Component

```tsx
// Componente dropdown para alternar unidades
<UnitSwitcher />
```

### Métricas Consolidadas

```typescript
const { data: metrics } = useConsolidatedMetrics({
  tenant_id: tenantId!,
  franchise_ids: ['franchise-1', 'franchise-2'],
  unit_ids: ['unit-1', 'unit-2'],
  date_start: '2024-01-01',
  date_end: '2024-12-31'
});

// metrics contém:
// - total_revenue
// - total_appointments
// - active_units
// - total_clients
```

### Isolamento de Dados (LGPD)

```sql
-- Exemplo de RLS Policy
CREATE POLICY "Units view own data"
ON appointments
FOR SELECT
USING (
  pet_shop_id IN (
    SELECT id FROM pet_shops
    WHERE owner_id = auth.uid()
    OR has_tenant_access(auth.uid(), tenant_id)
  )
  OR has_role(auth.uid(), 'admin')
);
```

---

## 📊 Sistema de Monitoramento {#monitoramento}

### Watchers (Monitoramento 24/7)

| Watcher | Função | Ação Automática |
|---------|--------|-----------------|
| **UI-Break Detector** | Detecta falhas visuais | Corrige UI automaticamente |
| **Performance Monitor** | Monitora queries lentas | Otimiza automaticamente |
| **Consistência de Dados** | Valida integridade | Corrige inconsistências |
| **Segurança & Permissões** | Monitora acessos | Bloqueia acessos inválidos |

### Triggers (Eventos Inteligentes)

| Trigger | Evento | Ações |
|---------|--------|-------|
| **onUserCreate** | Novo usuário criado | Validar dados, formatar telefones, calcular idade |
| **onAgendamentoCreate** | Novo agendamento | Verificar conflitos, validar profissional |
| **onFranquiaCreate** | Nova franquia | Provisionar DB, criar permissões, ativar watchers |
| **onError** | Erro detectado | Ativar Auto-Debug, corrigir, criar teste |

### Logs de Auditoria

```typescript
// Hooks para diferentes tipos de logs
const { logs, loading, loadLogs } = useAuditLogs(filters);
const { logs: systemLogs } = useAdvancedLogs();
const { events } = useAuthMonitor();
const { metrics } = useSystemMetrics();
```

### Páginas de Monitoramento

- `/system-monitoring` - Dashboard de monitoramento geral
- `/system-monitoring-dashboard` - "Modo Deus" com correções automáticas

---

## 🤖 Auto-Healing e Auto-Debug {#auto-healing}

### Automação Diária (03:00)

O sistema executa automaticamente todos os dias às 03:00:

1. ✅ Varredura de integridade de DB
2. ✅ Correção de campos inconsistentes
3. ✅ Verificação de relacionamentos quebrados
4. ✅ Otimização de performance
5. ✅ Testes funcionais completos
6. ✅ Limpeza de dados antigos
7. ✅ Verificação de RLS policies
8. ✅ Auditoria de segurança

### Auto-Debug Inteligente

Quando um erro ocorre:

```typescript
// 1. Detecta erro
try {
  // código
} catch (error) {
  // 2. Captura contexto
  const context = captureErrorContext(error);
  
  // 3. Identifica causa raiz
  const rootCause = analyzeRootCause(context);
  
  // 4. Propõe solução
  const solution = proposeSolution(rootCause);
  
  // 5. Aplica correção
  const fix = applyFix(solution);
  
  // 6. Testa correção
  const testResult = testFix(fix);
  
  // 7. Cria teste automatizado
  createAutomatedTest(fix, testResult);
  
  // 8. Documenta em log_autodebug
  logAutoDebug({
    error,
    rootCause,
    solution,
    fix,
    testResult
  });
}
```

### Hooks de Monitoramento

```typescript
// Monitoramento de erros
const { logError, logInfo } = useErrorMonitoring();

// Monitoramento de performance
const { logMetric } = usePerformanceMonitoring();

// Logs avançados
const { logs, exportLogs } = useAdvancedLogs();
```

---

## 🗄️ Banco de Dados {#banco-de-dados}

### Tabelas Principais

#### tenants
```sql
id                  uuid PRIMARY KEY
name                text NOT NULL
slug                text UNIQUE NOT NULL
logo_url            text
primary_color       text
active              boolean DEFAULT true
subscription_plan   text
settings            jsonb DEFAULT '{}'
created_at          timestamp DEFAULT now()
updated_at          timestamp DEFAULT now()
```

#### franchises
```sql
id                    uuid PRIMARY KEY
tenant_id             uuid NOT NULL (FK -> tenants)
owner_id              uuid NOT NULL (FK -> auth.users)
name                  text NOT NULL
code                  text UNIQUE NOT NULL
cnpj                  text
email                 text
phone                 text
address               text
city                  text
state                 text
active                boolean DEFAULT true
contract_start_date   date
contract_end_date     date
royalty_percentage    numeric DEFAULT 5.00
settings              jsonb DEFAULT '{}'
created_at            timestamp DEFAULT now()
updated_at            timestamp DEFAULT now()
```

#### pet_shops (Units)
```sql
id                      uuid PRIMARY KEY
tenant_id               uuid (FK -> tenants)
franchise_id            uuid (FK -> franchises)
owner_id                uuid NOT NULL (FK -> auth.users)
name                    text NOT NULL
code                    text UNIQUE NOT NULL
address                 text
city                    text
email                   text
phone                   text
logo_url                text
description             text
hours                   text
subscription_plan       text DEFAULT 'gratuito'
subscription_expires_at timestamp
created_at              timestamp DEFAULT now()
updated_at              timestamp DEFAULT now()
deleted_at              timestamp
```

#### user_hierarchy
```sql
id            uuid PRIMARY KEY
user_id       uuid NOT NULL (FK -> auth.users)
tenant_id     uuid
franchise_id  uuid
unit_id       uuid
role          text NOT NULL
permissions   text[] DEFAULT '{}'
active        boolean DEFAULT true
created_at    timestamp DEFAULT now()
updated_at    timestamp DEFAULT now()
```

### Funções SQL Importantes

```sql
-- Métricas consolidadas
CREATE FUNCTION get_consolidated_metrics(
  _tenant_id UUID,
  _franchise_ids UUID[],
  _unit_ids UUID[],
  _date_start DATE,
  _date_end DATE
) RETURNS TABLE (...);

-- Verificações de acesso
CREATE FUNCTION is_tenant_admin(_user_id UUID, _tenant_id UUID) RETURNS BOOLEAN;
CREATE FUNCTION is_franchise_owner(_user_id UUID, _franchise_id UUID) RETURNS BOOLEAN;
CREATE FUNCTION has_tenant_access(_user_id UUID, _tenant_id UUID) RETURNS BOOLEAN;

-- Permissões
CREATE FUNCTION has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN;
CREATE FUNCTION has_permission(...) RETURNS BOOLEAN;
```

---

## ⚛️ Frontend (React) {#frontend}

### Estrutura de Pastas

```
src/
├── components/         # Componentes reutilizáveis
│   ├── ui/            # Componentes base (shadcn)
│   ├── permissions/   # Componentes de permissão
│   └── admin/         # Componentes admin
├── pages/             # Páginas da aplicação
│   ├── admin/         # Páginas admin
│   ├── client/        # Páginas cliente
│   ├── petshop/       # Páginas pet shop
│   └── professional/  # Páginas profissional
├── hooks/             # Hooks customizados
├── lib/               # Utilitários e configurações
│   ├── tenant-context.tsx
│   └── utils.ts
├── types/             # TypeScript types
│   └── multi-tenant.ts
├── shared/            # Código compartilhado
│   ├── components/
│   └── hooks/
└── integrations/      # Integrações externas
    └── supabase/
```

---

## 🪝 Hooks Customizados {#hooks}

### Hooks de Permissões

```typescript
// usePermission - Verificar permissão específica
const { hasPermission, loading } = usePermission(
  petShopId, 
  'financial', 
  'view'
);

// useEmployeePermissions - Gerenciar permissões
const { 
  permissions, 
  updatePermissions,
  revokePermission 
} = useEmployeePermissions(employeeId);

// useAccessAudit - Logs de auditoria
const { logs, loadLogs, exportLogs } = useAccessAudit(petShopId);
```

### Hooks Multi-Unidades

```typescript
// useTenant - Contexto multi-tenant
const { 
  tenantId, 
  franchiseId, 
  unitId, 
  switchContext, 
  can 
} = useTenant();

// useMultiUnit - Gerenciar unidades
const { 
  currentUnit, 
  franchises, 
  switchUnit 
} = useMultiUnit();

// useConsolidatedMetrics - Métricas agregadas
const { data: metrics } = useConsolidatedMetrics(filters);
```

### Hooks de Monitoramento

```typescript
// useSystemMetrics - Métricas do sistema
const { metrics, collectMetric } = useSystemMetrics();

// useAuditLogs - Logs de auditoria
const { logs, createAuditLog } = useAuditLogs();

// useErrorMonitoring - Monitorar erros
const { logError, logInfo } = useErrorMonitoring();

// usePerformanceMonitoring - Performance
const { logMetric } = usePerformanceMonitoring();

// useAdvancedLogs - Logs avançados
const { logs, exportLogs } = useAdvancedLogs();

// useAuthMonitor - Monitorar autenticação
const { events, refresh } = useAuthMonitor();
```

---

## 🎨 Componentes UI {#componentes}

### Componentes de Permissão

```tsx
// PermissionGuard - Proteger componente
<PermissionGuard
  petShopId={petShopId}
  module="financial"
  action="view"
  showError={true}
  fallback={<AccessDenied />}
>
  <ProtectedContent />
</PermissionGuard>

// EmployeePermissionsManager - Gerenciar permissões
<EmployeePermissionsManager
  employeeId={employee.id}
  petShopId={petShop.id}
/>

// AccessAuditViewer - Visualizar auditoria
<AccessAuditViewer 
  petShopId={petShop.id}
  filters={{ module: 'financial' }}
/>
```

### Componentes Multi-Unidades

```tsx
// UnitSwitcher - Alternar unidades
<UnitSwitcher />

// UnitComparison - Comparar unidades
<UnitComparison unitIds={['unit-1', 'unit-2']} />

// UnitPermissions - Permissões por unidade
<UnitPermissions unitId={unitId} />
```

---

## 🔒 Segurança e Compliance {#seguranca}

### LGPD Compliance

1. **Isolamento Total de Dados**
   - RLS em todas as tabelas
   - Nenhuma unidade acessa dados de outras
   - Exceto Admin Master Global

2. **Auditoria Completa**
   - Todos os acessos registrados
   - Logs de modificações
   - Rastreabilidade total

3. **Consentimento e Privacidade**
   - Termos de uso
   - Política de privacidade
   - Direito ao esquecimento

### Row Level Security (RLS)

```sql
-- Exemplo completo de RLS
CREATE POLICY "Users view own data"
ON table_name
FOR SELECT
USING (
  -- Dono da unidade
  owner_id = auth.uid()
  -- OU tem acesso ao tenant
  OR has_tenant_access(auth.uid(), tenant_id)
  -- OU é admin
  OR has_role(auth.uid(), 'admin')
  -- OU é funcionário da unidade
  OR is_employee_of_petshop(auth.uid(), unit_id)
);
```

---

## 📖 Guia de Uso {#guia-de-uso}

### 1. Setup Inicial

```typescript
// main.tsx
import { TenantProvider } from '@/lib/tenant-context';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TenantProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </TenantProvider>
);
```

### 2. Criar Novo Tenant

```typescript
const { data, error } = await supabase
  .from('tenants')
  .insert({
    name: 'Minha Empresa',
    slug: 'minha-empresa',
    subscription_plan: 'enterprise'
  })
  .select()
  .single();
```

### 3. Criar Nova Franquia

```typescript
const { data, error } = await supabase
  .from('franchises')
  .insert({
    tenant_id: tenantId,
    owner_id: userId,
    name: 'Franquia Sul',
    code: 'FR-SUL-01'
  })
  .select()
  .single();
```

### 4. Criar Nova Unidade

```typescript
const { data, error } = await supabase
  .from('pet_shops')
  .insert({
    tenant_id: tenantId,
    franchise_id: franchiseId,
    owner_id: userId,
    name: 'Pet Shop Centro',
    code: 'PS-CENTRO-01'
  })
  .select()
  .single();
```

### 5. Adicionar Funcionário com Permissões

```typescript
// 1. Criar empregado
const { data: employee } = await supabase
  .from('petshop_employees')
  .insert({
    pet_shop_id: unitId,
    user_id: employeeUserId,
    name: 'João Silva',
    role: 'recepcionista'
  })
  .select()
  .single();

// 2. Atribuir permissões
const { updatePermissions } = useEmployeePermissions(employee.id);
await updatePermissions([
  'dashboard:view',
  'appointments:view',
  'appointments:create',
  'clients:view'
]);
```

---

## 🔧 Troubleshooting {#troubleshooting}

### Problema: "Cannot read property 'id' of null"
**Causa**: TenantProvider não está envolvendo a aplicação  
**Solução**: Adicionar `<TenantProvider>` no nível superior

### Problema: "RLS policy violation"
**Causa**: Usuário sem permissões corretas  
**Solução**: Verificar `user_hierarchy` e `employee_permissions`

### Problema: Unidades não carregando
**Causa**: Dados inconsistentes no banco  
**Solução**: Executar "Modo Deus" para correção automática

### Problema: Permissões não funcionando
**Causa**: Falta de registros em `permissions` ou `employee_permissions`  
**Solução**: Criar permissões base e atribuir ao funcionário

### Problema: Erro ao trocar de unidade
**Causa**: Unit ID inválido ou contexto corrompido  
**Solução**: Limpar localStorage e refazer login

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar documentação completa
2. Executar "Modo Deus" para correções automáticas
3. Verificar logs de auditoria
4. Contatar suporte técnico

---

## 🚀 Roadmap

- ✅ Sistema RBAC
- ✅ Multi-unidades base
- ✅ Sistema de monitoramento
- ✅ Auto-healing básico
- 🔄 Dashboards consolidados avançados
- 🔄 Relatórios customizáveis
- 🔄 BI preditivo com IA
- 🔄 Notificações multi-canal
- 🔄 App mobile nativo
- 🔄 Integrações externas (WhatsApp, SMS, Email)

---

**Versão**: 2.0  
**Última Atualização**: 2024  
**Licença**: Proprietária - EasyPet Enterprise
