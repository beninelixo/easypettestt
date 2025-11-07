# 🏢 Sistema de Multi-Unidades EasyPet

## 📋 Visão Geral

O Sistema de Multi-Unidades do EasyPet permite que empresas gerenciem múltiplas lojas (unidades) de forma centralizada, com relatórios consolidados, permissões granulares e comparações de performance entre unidades.

## 🎯 Principais Funcionalidades

### 1. **Gestão Centralizada**
- Dashboard consolidado com visão de todas as unidades
- Filtros por franquia, unidade e período
- Métricas agregadas em tempo real
- Comparação de performance entre unidades

### 2. **Hierarquia Organizacional**
```
Tenant (Rede)
  └── Franchise (Franquia)
      └── Unit (Unidade/Loja)
          └── Employees (Funcionários)
```

### 3. **Sistema de Permissões**

#### Níveis de Acesso:
- **Tenant Admin**: Acesso total a todas franquias e unidades
- **Franchise Owner**: Acesso às unidades de sua franquia
- **Unit Manager**: Acesso apenas à sua unidade
- **Employee**: Acesso limitado conforme permissões

#### Permissões Disponíveis:
- `view_dashboard` - Ver dashboard da unidade
- `view_reports` - Acessar relatórios
- `manage_appointments` - Gerenciar agendamentos
- `manage_clients` - Gerenciar clientes
- `manage_services` - Configurar serviços
- `manage_employees` - Gerenciar funcionários
- `manage_units` - Administrar unidades
- `view_consolidated` - Ver dashboard consolidado
- `delete_records` - Excluir registros permanentemente

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `tenants`
```sql
- id: UUID
- name: TEXT
- slug: TEXT (unique)
- logo_url: TEXT
- primary_color: TEXT
- subscription_plan: TEXT
- settings: JSONB
- active: BOOLEAN
```

#### `franchises`
```sql
- id: UUID
- tenant_id: UUID (FK)
- owner_id: UUID (FK auth.users)
- name: TEXT
- code: TEXT (unique)
- cnpj: TEXT
- royalty_percentage: NUMERIC
- contract_start_date: DATE
- contract_end_date: DATE
- settings: JSONB
- active: BOOLEAN
```

#### `pet_shops` (Units)
```sql
- id: UUID
- franchise_id: UUID (FK)
- owner_id: UUID (FK auth.users)
- name: TEXT
- code: TEXT (unique)
- address, city, state: TEXT
- subscription_plan: TEXT
- cakto_customer_id: TEXT
```

#### `user_hierarchy`
```sql
- id: UUID
- user_id: UUID (FK auth.users)
- tenant_id: UUID (FK)
- franchise_id: UUID (FK)
- unit_id: UUID (FK)
- role: TEXT
- permissions: TEXT[]
- active: BOOLEAN
```

### Funções do Banco de Dados

#### `get_consolidated_metrics`
```sql
CREATE FUNCTION get_consolidated_metrics(
  _tenant_id UUID,
  _franchise_ids UUID[],
  _unit_ids UUID[],
  _start_date DATE,
  _end_date DATE
) RETURNS JSONB;
```

Retorna métricas consolidadas:
- `total_revenue`: Faturamento total
- `total_appointments`: Total de agendamentos
- `active_units`: Unidades ativas
- `total_clients`: Clientes únicos

#### Funções de Permissão
```sql
-- Verifica se usuário é admin do tenant
is_tenant_admin(_user_id UUID, _tenant_id UUID) RETURNS BOOLEAN

-- Verifica se usuário é dono da franquia
is_franchise_owner(_user_id UUID, _franchise_id UUID) RETURNS BOOLEAN

-- Verifica se usuário tem acesso ao tenant
has_tenant_access(_user_id UUID, _tenant_id UUID) RETURNS BOOLEAN
```

## 🔧 Implementação Frontend

### Context API

#### `TenantContext`
Gerencia o contexto global do tenant/franquia/unidade:

```typescript
interface TenantContextType {
  tenantId: string | null;
  franchiseId: string | null;
  unitId: string | null;
  userRole: string | null;
  permissions: string[];
  user: User | null;
  loading: boolean;
  switchContext: (tenantId?, franchiseId?, unitId?) => void;
  can: (permission: string) => boolean;
}
```

### Hooks Personalizados

#### `useMultiUnit()`
```typescript
const { 
  currentUnit,      // Unidade atual
  franchises,       // Lista de franquias e unidades
  switchUnit,       // Trocar unidade ativa
  loading,
  error
} = useMultiUnit();
```

#### `useConsolidatedMetrics()`
```typescript
const { 
  data: metrics,    // Métricas consolidadas
  isLoading 
} = useConsolidatedMetrics({
  tenant_id,
  franchise_ids,
  unit_ids,
  date_start,
  date_end
});
```

### Componentes Principais

#### 1. `UnitSwitcher`
Seletor de unidades com busca e agrupamento por franquia:
```tsx
<UnitSwitcher />
```

#### 2. `ConsolidatedDashboard`
Dashboard com métricas agregadas de todas as unidades:
- Filtros por período, franquia e unidade
- Cartões de métricas (faturamento, agendamentos, clientes)
- Tabela de performance por unidade
- Gráficos comparativos

#### 3. `UnitsManagement`
Gestão de unidades:
- Grid/Tabela de unidades
- Adicionar novas unidades
- Configurar permissões
- Status e alertas por unidade

#### 4. `UnitPermissions`
Configuração de permissões por unidade:
```tsx
<UnitPermissions
  selectedPermissions={permissions}
  onPermissionChange={(id, checked) => {...}}
  role={userRole}
/>
```

#### 5. `UnitComparison`
Comparação visual entre unidades:
```tsx
<UnitComparison units={unitMetrics} />
```

## 🚀 Como Usar

### 1. Criar um Tenant
```typescript
// Via dashboard admin ou SQL
INSERT INTO tenants (name, slug, primary_color)
VALUES ('Pet Network', 'pet-network', '#3B82F6');
```

### 2. Criar Franquias
```typescript
// Via dashboard tenant admin
INSERT INTO franchises (tenant_id, owner_id, name, code)
VALUES (tenant_id, owner_id, 'Franquia Sul', 'FRAN-SUL');
```

### 3. Vincular Unidades
```typescript
// Atualizar pet_shop existente
UPDATE pet_shops 
SET franchise_id = franchise_id
WHERE id = unit_id;
```

### 4. Configurar Hierarquia de Usuário
```typescript
INSERT INTO user_hierarchy (
  user_id, 
  tenant_id, 
  franchise_id, 
  unit_id,
  role, 
  permissions
) VALUES (
  user_id,
  tenant_id,
  franchise_id,
  unit_id,
  'unit_manager',
  ARRAY['view_dashboard', 'manage_appointments', 'manage_clients']
);
```

### 5. Acessar Dashboard Consolidado
```
/multi-unit/dashboard
```

### 6. Gerenciar Unidades
```
/multi-unit/management
```

## 📱 Rotas do Sistema

### Rotas Multi-Unidades
- `/multi-unit/dashboard` - Dashboard consolidado
- `/multi-unit/management` - Gestão de unidades

### Rotas de Tenant
- `/tenant-dashboard` - Dashboard do tenant admin

### Rotas de Franquia
- `/franchise-dashboard` - Dashboard do franchise owner

## 🔐 Segurança e RLS

### Row Level Security (RLS)

Todas as tabelas multi-tenant têm RLS habilitado:

```sql
-- Exemplo: franchises
CREATE POLICY "Users can view franchises in their tenant"
ON franchises FOR SELECT
USING (has_tenant_access(auth.uid(), tenant_id));

-- Exemplo: user_hierarchy
CREATE POLICY "Users can view their own hierarchy"
ON user_hierarchy FOR SELECT
USING (
  user_id = auth.uid() 
  OR is_tenant_admin(auth.uid(), tenant_id)
);
```

### Verificação de Permissões

Frontend:
```typescript
const { can } = useTenant();

if (can('manage_units')) {
  // Mostrar botão de gerenciar
}
```

Backend (Edge Function):
```typescript
const { data: hierarchy } = await supabase
  .from('user_hierarchy')
  .select('permissions')
  .eq('user_id', user.id)
  .single();

if (!hierarchy.permissions.includes('manage_units')) {
  return new Response('Forbidden', { status: 403 });
}
```

## 📈 Métricas e Relatórios

### Métricas Consolidadas
- **Faturamento Total**: Soma de todas as unidades
- **Agendamentos**: Total e média por unidade
- **Clientes Ativos**: Clientes únicos em todas as unidades
- **Unidades Ativas**: Número de unidades operacionais

### Relatórios Disponíveis
1. **Performance por Unidade**: Ranking de desempenho
2. **Comparativo Temporal**: Evolução ao longo do tempo
3. **Análise de Crescimento**: Taxa de crescimento por unidade
4. **Eficiência Operacional**: Produtividade e utilização

### Exportação
- CSV
- Excel
- PDF
- API para integração

## 🎨 Personalização

### Cores por Tenant
```typescript
// index.css
:root[data-tenant="pet-network"] {
  --primary: hsl(221, 83%, 53%);
  --secondary: hsl(212, 95%, 68%);
}
```

### Logo Personalizado
```typescript
const { tenantId } = useTenant();
const { data: tenant } = await supabase
  .from('tenants')
  .select('logo_url, primary_color')
  .eq('id', tenantId)
  .single();
```

## 🔄 Fluxo de Trabalho

### Onboarding de Nova Unidade
1. Tenant admin cria nova franquia (se necessário)
2. Franchise owner adiciona nova unidade
3. Unit manager é designado
4. Permissões são configuradas
5. Funcionários são adicionados
6. Unidade fica ativa no sistema

### Relatório Mensal
1. Selecionar período no dashboard consolidado
2. Filtrar por franquias/unidades (opcional)
3. Analisar métricas agregadas
4. Comparar performance entre unidades
5. Exportar relatório para apresentação

## 🛠️ Manutenção

### Adicionar Nova Permissão
1. Atualizar enum de permissões (se usar enum)
2. Adicionar em `src/components/multi-unit/UnitPermissions.tsx`
3. Implementar verificação no backend
4. Atualizar RLS policies se necessário
5. Documentar nova permissão

### Adicionar Nova Métrica
1. Criar função SQL `get_metric_name()`
2. Adicionar tipo em `ConsolidatedMetrics`
3. Atualizar `useConsolidatedMetrics` hook
4. Adicionar card no dashboard
5. Criar visualização gráfica

## 📚 Referências

### Arquivos Principais
- `src/lib/tenant-context.tsx` - Context API
- `src/shared/hooks/useMultiUnit.ts` - Hook multi-unidade
- `src/shared/hooks/useConsolidated.ts` - Hook métricas consolidadas
- `src/pages/multi-unit/ConsolidatedDashboard.tsx` - Dashboard principal
- `src/pages/multi-unit/UnitsManagement.tsx` - Gestão de unidades
- `src/components/multi-unit/UnitPermissions.tsx` - Permissões
- `src/components/multi-unit/UnitComparison.tsx` - Comparação

### Banco de Dados
- Tabelas: `tenants`, `franchises`, `pet_shops`, `user_hierarchy`
- Funções: `get_consolidated_metrics`, `is_tenant_admin`, `has_tenant_access`
- RLS: Policies em todas as tabelas multi-tenant

## 🚨 Troubleshooting

### Problema: Não consigo ver dashboard consolidado
**Solução**: Verificar se usuário tem `tenant_id` na tabela `user_hierarchy` e permissão `view_consolidated`

### Problema: Unidades não aparecem no seletor
**Solução**: Verificar se `franchise_id` está preenchido na tabela `pet_shops`

### Problema: Métricas retornam 0
**Solução**: Verificar RLS policies e se usuário tem acesso às franquias/unidades

### Problema: Erro de permissão ao acessar
**Solução**: Verificar array `permissions` em `user_hierarchy` e função `can()` do context

## 💡 Boas Práticas

1. **Sempre usar context**: `useTenant()` para verificar permissões
2. **RLS em tudo**: Nunca confiar apenas no frontend
3. **Cache inteligente**: React Query com `staleTime` apropriado
4. **Logging**: Registrar ações administrativas em audit_logs
5. **Performance**: Limitar queries a 100 registros por padrão
6. **UX**: Loading states e error handling em todos os componentes
7. **Segurança**: Validar inputs e sanitizar dados

## 🎯 Roadmap

- [ ] Mapa interativo de unidades
- [ ] Alertas automáticos de performance
- [ ] Recomendações baseadas em IA
- [ ] Comparação com benchmarks do setor
- [ ] App mobile para gestores
- [ ] Integração com sistemas de ERP
- [ ] Relatórios personalizados com drag-and-drop

---

**Versão**: 1.0.0  
**Última Atualização**: 2025-01-07  
**Mantido por**: Equipe EasyPet
