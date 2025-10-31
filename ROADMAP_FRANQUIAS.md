# 🚀 Roadmap de Evolução: Sistema de Franquias Pet Shop
## Superando o LoopVet - Multi-Tenant Enterprise SaaS

---

## 📊 FASE 1: Análise de Mercado e Diferenciação

### 🎯 Análise LoopVet (Principal Concorrente)

#### Pontos Fortes do LoopVet:
- ✅ Interface moderna e intuitiva
- ✅ Gestão de agendamentos eficiente
- ✅ Prontuário eletrônico veterinário
- ✅ Integração com WhatsApp
- ✅ Aplicativo mobile para clientes

#### Gaps Identificados no LoopVet:
- ❌ **Gestão de Franquias**: Limitado para redes com múltiplas unidades
- ❌ **Royalties**: Sem cálculo automático
- ❌ **Consolidação Multi-Unidade**: Relatórios não unificados
- ❌ **Hierarquia de Acesso**: Estrutura simples, não suporta franqueadora
- ❌ **Padronização**: Sem controle centralizado de processos
- ❌ **BI Avançado**: Relatórios básicos sem comparativos
- ❌ **Automação de Marketing**: Limitada
- ❌ **Gestão de Estoque em Rede**: Sem transferência entre unidades

### 🏆 Nossa Diferenciação (Oportunidades)

```mermaid
graph TB
    subgraph "Sistema Atual - Single Tenant"
        A1[Pet Shop Individual]
        A1 --> B1[Dashboard Único]
        A1 --> C1[Relatórios Locais]
    end
    
    subgraph "Sistema Futuro - Multi-Tenant Enterprise"
        M[Franqueadora Master]
        M --> F1[Franquia A]
        M --> F2[Franquia B]
        M --> F3[Franquia C]
        
        F1 --> U1[Unidade 1]
        F1 --> U2[Unidade 2]
        F2 --> U3[Unidade 3]
        F3 --> U4[Unidade 4]
        
        M --> DM[Dashboard Master]
        DM --> BI[BI Consolidado]
        DM --> ROY[Royalties Auto]
        DM --> PAD[Padronização]
        DM --> AUD[Auditoria]
    end
</mermaid>

### 📋 Funcionalidades Exclusivas Propostas

#### 1. **Gestão de Franquias**
- 🏢 Hierarquia: Franqueadora → Franquia → Unidade → Funcionário
- 📊 Dashboard consolidado com drill-down
- 🎯 Metas por unidade/franquia
- 📈 Benchmarking entre unidades

#### 2. **Royalties Inteligentes**
- 💰 Cálculo automático por:
  - % do faturamento
  - % por serviço
  - Taxa fixa mensal
  - Modelo híbrido
- 📅 Geração automática de boletos
- 📧 Notificações de vencimento
- 📊 Histórico e previsões

#### 3. **Padronização Operacional**
- ✅ Checklist de procedimentos
- 📚 Base de conhecimento centralizada
- 🎓 Treinamentos obrigatórios
- ⏱️ Tempo médio por serviço
- 🔍 Auditoria de qualidade

#### 4. **BI e Analytics Avançado**
- 📊 Dashboards personalizáveis
- 🔄 Comparativos automáticos
- 📈 Previsão de demanda (ML)
- 💡 Insights acionáveis
- 📱 App mobile para franqueados

#### 5. **Gestão de Estoque em Rede**
- 📦 Transferência entre unidades
- 🚚 Logística centralizada
- 💵 Compra coletiva
- ⚠️ Alertas inteligentes
- 📊 Consolidação de inventário

---

## 🏗️ FASE 2: Arquitetura Multi-Tenant SaaS

### 🎨 Estratégia de Multi-Tenancy

#### Modelo Escolhido: **Híbrido (Shared Schema + Row-Level Security)**

```sql
-- Hierarquia de Dados
┌─────────────────────────────────────┐
│   TENANT (Franqueadora)             │
│   tenant_id: uuid                   │
└─────────────────────────────────────┘
           │
           ├── franchises (Franquias)
           │   ├── units (Unidades)
           │   │   ├── employees
           │   │   ├── appointments
           │   │   ├── pets
           │   │   └── inventory
           │   └── royalty_config
           └── brand_standards
```

### 📐 Modelo de Dados Proposto

```sql
-- ==============================================
-- HIERARQUIA MULTI-TENANT
-- ==============================================

-- 1. Tenants (Franqueadoras)
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL, -- ex: petland, petz
  logo_url text,
  subscription_tier text NOT NULL, -- starter, pro, enterprise
  subscription_status text DEFAULT 'active',
  max_franchises integer,
  max_units integer,
  created_at timestamptz DEFAULT now(),
  settings jsonb DEFAULT '{}'::jsonb
);

-- 2. Franchises (Franquias)
CREATE TABLE franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text UNIQUE NOT NULL, -- ex: PETLAND-SP-001
  owner_id uuid REFERENCES auth.users(id),
  address jsonb,
  royalty_config jsonb, -- { type: 'percentage', value: 5, frequency: 'monthly' }
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- 3. Units (Unidades - evolução da tabela pet_shops)
ALTER TABLE pet_shops ADD COLUMN franchise_id uuid REFERENCES franchises(id);
ALTER TABLE pet_shops ADD COLUMN tenant_id uuid REFERENCES tenants(id);
ALTER TABLE pet_shops ADD COLUMN unit_code text;
ALTER TABLE pet_shops ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;

-- 4. Royalties
CREATE TABLE royalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  franchise_id uuid REFERENCES franchises(id),
  reference_month date NOT NULL,
  base_value numeric NOT NULL, -- faturamento base
  royalty_value numeric NOT NULL, -- valor calculado
  royalty_percentage numeric,
  status text DEFAULT 'pending', -- pending, paid, overdue
  due_date date NOT NULL,
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(franchise_id, reference_month)
);

-- 5. Brand Standards (Padrões da Franqueadora)
CREATE TABLE brand_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  category text NOT NULL, -- service, product, process, quality
  title text NOT NULL,
  description text,
  checklist jsonb, -- [{ item: '...', mandatory: true }]
  attachments jsonb, -- [{ name: '...', url: '...' }]
  applies_to text[], -- ['all', 'franchise_id', 'unit_id']
  active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Compliance Audits (Auditorias)
CREATE TABLE compliance_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  franchise_id uuid REFERENCES franchises(id),
  unit_id uuid REFERENCES pet_shops(id),
  standard_id uuid REFERENCES brand_standards(id),
  auditor_id uuid REFERENCES auth.users(id),
  audit_date date NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  findings jsonb, -- { item: '...', compliant: true/false, notes: '...' }
  action_plan text,
  status text DEFAULT 'pending', -- pending, in_progress, resolved
  created_at timestamptz DEFAULT now()
);

-- 7. User Roles (Expansão)
DO $$ 
BEGIN
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'tenant_admin'; -- Admin da franqueadora
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'franchise_owner'; -- Dono da franquia
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'unit_manager'; -- Gerente de unidade
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 8. User Hierarchy
CREATE TABLE user_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id),
  franchise_id uuid REFERENCES franchises(id),
  unit_id uuid REFERENCES pet_shops(id),
  role app_role NOT NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);
```

### 🔐 Segurança Multi-Tenant (RLS Policies)

```sql
-- Policy Global: Isolar dados por Tenant
CREATE POLICY "tenant_isolation"
  ON franchises FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
  );

-- Function Helper: Set Current Tenant
CREATE OR REPLACE FUNCTION set_current_tenant(_tenant_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', _tenant_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Middleware no Backend executaria:
-- SELECT set_current_tenant('uuid-do-tenant');
```

### 🚀 Stack Tecnológica Recomendada

#### Backend
```typescript
// API Architecture
┌─────────────────────────────────────┐
│   API Gateway (Kong / AWS API GW)  │
└─────────────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼────┐   ┌───▼────┐
│ Auth   │   │ Core   │
│Service │   │Service │
└────────┘   └────────┘
    │             │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ PostgreSQL  │
    │ (Supabase)  │
    └─────────────┘
```

**Tecnologias:**
- ✅ **Supabase**: Auth + DB + Storage + Realtime (já em uso)
- ✅ **Edge Functions**: Lógica de negócio serverless
- ✅ **Redis**: Cache distribuído (sessions, queries frequentes)
- ✅ **Bull/BullMQ**: Filas para processamento async (royalties, relatórios)
- ✅ **PostgreSQL**: Particionamento por tenant_id para escala

#### Frontend
```typescript
// Component Architecture
src/
├── features/
│   ├── tenant-admin/     # Dashboard franqueadora
│   │   ├── franchises/
│   │   ├── royalties/
│   │   ├── analytics/
│   │   └── standards/
│   ├── franchise/        # Dashboard franquia
│   │   ├── units/
│   │   ├── performance/
│   │   └── reports/
│   └── unit/            # Dashboard unidade (atual)
│       ├── appointments/
│       ├── clients/
│       └── inventory/
├── shared/
│   ├── components/
│   ├── hooks/
│   │   ├── useTenant.ts
│   │   ├── useMultiUnit.ts
│   │   └── useConsolidated.ts
│   └── layouts/
│       ├── TenantLayout.tsx
│       ├── FranchiseLayout.tsx
│       └── UnitLayout.tsx
└── lib/
    ├── tenant-context.ts
    └── rbac.ts
```

**Bibliotecas Adicionais:**
- ✅ **Zustand**: State management (substituir Context API)
- ✅ **React Query**: Cache e sync de dados
- ✅ **Recharts**: Gráficos avançados (já em uso)
- ✅ **Framer Motion**: Animações fluidas
- ✅ **React Table**: Tabelas complexas com filtros
- ✅ **date-fns**: Manipulação de datas (já em uso)

---

## 🎨 FASE 3: Design e UX Multi-Nível

### 📱 Hierarquia de Dashboards

#### 1. **Tenant Dashboard (Franqueadora Master)**

```typescript
// Layout: TenantDashboard.tsx
interface TenantMetrics {
  totalFranchises: number;
  totalUnits: number;
  totalRevenue: number;
  totalRoyalties: number;
  activeClients: number;
  totalAppointments: number;
  averageTicket: number;
  growthRate: number;
}

// Widgets:
// - 🗺️ Mapa com localização das unidades
// - 📊 Gráfico de faturamento consolidado
// - 🏆 Ranking de unidades por desempenho
// - 💰 Previsão de royalties
// - ⚠️ Alertas de compliance
// - 📈 Comparativo mês a mês
```

**Wireframe:**
```
┌────────────────────────────────────────────────────┐
│  🏢 PetLand Master             👤 Admin  [Sair]   │
├────────────────────────────────────────────────────┤
│                                                     │
│  📊 Visão Geral da Rede          📅 Junho 2025    │
│                                                     │
│  ┌───────────┬───────────┬───────────┬──────────┐ │
│  │ 45        │ 123       │ R$ 2.4M   │ R$ 120K  │ │
│  │ Franquias │ Unidades  │ Faturamento│ Royalties│ │
│  └───────────┴───────────┴───────────┴──────────┘ │
│                                                     │
│  ┌─────────────────────────┬────────────────────┐ │
│  │ 📈 Receita por Mês      │ 🗺️ Unidades por   │ │
│  │ [Gráfico de Linha]      │   Região (Mapa)    │ │
│  │                          │                    │ │
│  └─────────────────────────┴────────────────────┘ │
│                                                     │
│  🏆 Top 10 Unidades                                │
│  ┌──────────────────────────────────────────────┐ │
│  │ 1. Petland SP-001  | R$ 45K | 98% compliance│ │
│  │ 2. Petland RJ-003  | R$ 42K | 95% compliance│ │
│  │ 3. Petland MG-002  | R$ 38K | 92% compliance│ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ⚠️ Alertas e Ações Necessárias                    │
│  - 3 unidades com estoque baixo                    │
│  - 2 auditorias pendentes                          │
│  - 5 royalties em atraso                           │
└────────────────────────────────────────────────────┘
```

#### 2. **Franchise Dashboard (Franqueado)**

```typescript
interface FranchiseMetrics {
  franchise: Franchise;
  units: Unit[];
  totalRevenue: number;
  royaltiesDue: number;
  complianceScore: number;
  topPerformingUnit: Unit;
  alerts: Alert[];
}

// Features:
// - Alternar entre unidades
// - Relatórios consolidados da franquia
// - Gestão de funcionários multi-unidade
// - Transferência de estoque entre unidades
// - Dashboard de compliance
```

**Wireframe:**
```
┌────────────────────────────────────────────────────┐
│  🏬 Franquia SP-001         [Trocar Unidade ▼]    │
├────────────────────────────────────────────────────┤
│                                                     │
│  Minhas Unidades (5)              💰 Royalties:    │
│  ✅ Jardins - SP     ⚠️ 2 alertas     R$ 5.400,00  │
│  ✅ Moema - SP                    Venc: 10/07/2025 │
│  ✅ Pinheiros - SP                                  │
│  ⚠️ Vila Mariana     [Ver Pendências]              │
│                                                     │
│  ┌─────────────────────────┬────────────────────┐ │
│  │ 📊 Performance Geral    │ 📦 Estoque Total   │ │
│  │ R$ 180K faturamento     │ 1.2K produtos      │ │
│  │ 450 agendamentos        │ ⚠️ 12 itens baixos │ │
│  └─────────────────────────┴────────────────────┘ │
│                                                     │
│  📈 Comparativo entre Unidades                     │
│  [Gráfico de Barras - Faturamento por Unidade]    │
│                                                     │
│  🎓 Treinamentos Pendentes                         │
│  - "Novo protocolo de banho" (3 funcionários)     │
│  - "Uso do sistema v2.0" (8 funcionários)         │
└────────────────────────────────────────────────────┘
```

#### 3. **Unit Dashboard (Gerente de Unidade)** - JÁ EXISTE

Melhorias propostas:
- ✅ Comparação com média da rede
- ✅ Metas mensais com progresso visual
- ✅ Checklist de compliance diário
- ✅ Alertas de processos fora do padrão

### 🎯 Componentes de UX Avançados

#### 1. **Unit Switcher**
```typescript
// components/UnitSwitcher.tsx
const UnitSwitcher = () => {
  const { currentUnit, units, switchUnit } = useMultiUnit();
  
  return (
    <Select value={currentUnit.id} onValueChange={switchUnit}>
      <SelectTrigger className="w-[300px]">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue>
          {currentUnit.name} - {currentUnit.code}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            <div className="flex items-center justify-between w-full">
              <span>{unit.name}</span>
              {unit.alerts > 0 && (
                <Badge variant="destructive">{unit.alerts}</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

#### 2. **Consolidated Filters**
```typescript
// hooks/useConsolidatedData.ts
interface ConsolidatedFilters {
  tenant?: string;
  franchises?: string[];
  units?: string[];
  dateRange: { start: Date; end: Date };
  metrics: string[];
}

const useConsolidatedData = (filters: ConsolidatedFilters) => {
  return useQuery({
    queryKey: ['consolidated', filters],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_consolidated_metrics', {
        _tenant_id: filters.tenant,
        _franchise_ids: filters.franchises,
        _unit_ids: filters.units,
        _start_date: filters.dateRange.start,
        _end_date: filters.dateRange.end,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

---

## ⚙️ FASE 4: Funcionalidades Avançadas

### 1. 💰 Sistema de Royalties

#### Configuração
```typescript
interface RoyaltyConfig {
  type: 'percentage' | 'fixed' | 'tiered' | 'hybrid';
  
  // Para percentage
  percentage?: number; // ex: 5%
  baseOn?: 'gross_revenue' | 'net_revenue' | 'services_only';
  
  // Para fixed
  fixedAmount?: number; // ex: R$ 2000/mês
  
  // Para tiered
  tiers?: Array<{
    from: number;
    to: number;
    rate: number;
  }>;
  
  // Configurações gerais
  frequency: 'monthly' | 'quarterly' | 'annual';
  dueDay: number; // dia do vencimento
  gracePeriod: number; // dias de tolerância
  penaltyRate: number; // multa por atraso
}
```

#### Cálculo Automático (Edge Function)
```typescript
// supabase/functions/calculate-royalties/index.ts
export default async (req: Request) => {
  const { tenant_id, reference_month } = await req.json();
  
  // 1. Buscar todas as franquias do tenant
  const franchises = await getFranchises(tenant_id);
  
  for (const franchise of franchises) {
    // 2. Calcular faturamento do mês
    const revenue = await getRevenueForMonth(
      franchise.id, 
      reference_month
    );
    
    // 3. Aplicar fórmula de royalty
    const royalty = calculateRoyalty(
      revenue, 
      franchise.royalty_config
    );
    
    // 4. Criar registro de royalty
    await supabase.from('royalties').insert({
      tenant_id,
      franchise_id: franchise.id,
      reference_month,
      base_value: revenue,
      royalty_value: royalty.amount,
      royalty_percentage: royalty.rate,
      due_date: getDueDate(reference_month, franchise.royalty_config),
      status: 'pending',
    });
    
    // 5. Notificar franqueado
    await sendRoyaltyNotification(franchise.owner_id, royalty);
  }
  
  return new Response(JSON.stringify({ success: true }));
};
```

#### Dashboard de Royalties
```typescript
// pages/tenant/Royalties.tsx
const RoyaltiesDashboard = () => {
  return (
    <div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="pending">Pendentes ({pending})</TabsTrigger>
          <TabsTrigger value="paid">Pagos</TabsTrigger>
          <TabsTrigger value="overdue">Atrasados ({overdue})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Gráfico de royalties recebidos x esperados */}
          {/* Lista de franquias com status de pagamento */}
          {/* Previsão de próximos recebimentos */}
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### 2. 📚 Padronização e Compliance

#### Checklist de Procedimentos
```typescript
interface BrandStandard {
  id: string;
  tenant_id: string;
  category: 'service' | 'product' | 'process' | 'quality';
  title: string;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  mandatory: boolean;
}

interface ChecklistItem {
  id: string;
  description: string;
  mandatory: boolean;
  expectedDuration?: number; // minutos
  order: number;
}

// Exemplo: Checklist de Banho
const banhoChecklist: BrandStandard = {
  category: 'service',
  title: 'Protocolo de Banho e Tosa',
  checklist: [
    { description: 'Verificar ficha do pet (alergias, restrições)', mandatory: true },
    { description: 'Escovar antes do banho', mandatory: true },
    { description: 'Verificar temperatura da água (38-39°C)', mandatory: true },
    { description: 'Aplicar shampoo específico', mandatory: true },
    { description: 'Secar completamente', mandatory: true },
    { description: 'Tosar conforme padrão solicitado', mandatory: false },
    { description: 'Limpar ouvidos', mandatory: false },
    { description: 'Cortar unhas', mandatory: false },
  ],
};
```

#### Tela de Compliance
```typescript
// pages/tenant/Compliance.tsx
const ComplianceDashboard = () => {
  const { data: audits } = useQuery({
    queryKey: ['compliance-audits'],
    queryFn: getComplianceAudits,
  });
  
  return (
    <div>
      <h1>Compliance e Qualidade</h1>
      
      {/* Score Geral da Rede */}
      <Card>
        <CardHeader>
          <CardTitle>Score de Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={averageScore} className="flex-1" />
            <span className="text-3xl font-bold">{averageScore}%</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Unidades Fora do Padrão */}
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Unidades Requerem Atenção</CardTitle>
        </CardHeader>
        <CardContent>
          {lowScoreUnits.map(unit => (
            <Alert key={unit.id} variant="destructive">
              <AlertTitle>{unit.name}</AlertTitle>
              <AlertDescription>
                Score: {unit.score}% - {unit.findings.length} não conformidades
              </AlertDescription>
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
```

### 3. 📊 BI Avançado com ML

#### Previsão de Demanda
```typescript
// Edge Function com TensorFlow.js ou chamada para Lovable AI
import { createClient } from '@supabase/supabase-js';

export default async (req: Request) => {
  const { unit_id, service_id, forecast_days } = await req.json();
  
  // 1. Buscar dados históricos
  const historicalData = await getHistoricalAppointments(unit_id, service_id);
  
  // 2. Preparar dados para modelo
  const features = prepareTimeSeriesData(historicalData);
  
  // 3. Fazer previsão usando Lovable AI
  const prediction = await fetch('https://lovable-ai.api/predict', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      prompt: `Baseado nos seguintes dados de agendamentos: ${JSON.stringify(features)}, 
               preveja a demanda para os próximos ${forecast_days} dias`,
    }),
  });
  
  const forecast = await prediction.json();
  
  return new Response(JSON.stringify(forecast));
};
```

#### Insights Acionáveis
```typescript
// components/InsightsPanel.tsx
interface Insight {
  type: 'opportunity' | 'risk' | 'optimization';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actions: Action[];
}

// Exemplos:
const insights: Insight[] = [
  {
    type: 'opportunity',
    title: 'Potencial de crescimento em banhos',
    description: 'A demanda por banhos aumentou 25% no último mês. Considere contratar mais 1 banhista.',
    impact: 'high',
    actions: [
      { label: 'Ver vagas', action: () => navigate('/hr/jobs') },
      { label: 'Analisar horários', action: () => navigate('/schedule') },
    ],
  },
  {
    type: 'risk',
    title: 'Estoque de shampoo baixo',
    description: 'Com a demanda atual, o estoque se esgota em 5 dias.',
    impact: 'medium',
    actions: [
      { label: 'Fazer pedido', action: () => navigate('/inventory/order') },
    ],
  },
];
```

### 4. 🔄 Gestão de Estoque em Rede

#### Transferência Entre Unidades
```typescript
// pages/franchise/StockTransfer.tsx
interface StockTransfer {
  id: string;
  from_unit_id: string;
  to_unit_id: string;
  product_id: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  requested_by: string;
  approved_by?: string;
  shipped_at?: Date;
  received_at?: Date;
}

const StockTransferForm = () => {
  const handleTransfer = async (data: StockTransfer) => {
    // 1. Verificar disponibilidade na unidade origem
    const available = await checkStock(data.from_unit_id, data.product_id);
    
    if (available < data.quantity) {
      toast.error('Estoque insuficiente na unidade origem');
      return;
    }
    
    // 2. Criar transferência
    await supabase.from('stock_transfers').insert(data);
    
    // 3. Atualizar estoques
    await Promise.all([
      updateStock(data.from_unit_id, data.product_id, -data.quantity),
      updateStock(data.to_unit_id, data.product_id, data.quantity),
    ]);
    
    // 4. Notificar ambas as unidades
    await notifyTransfer(data);
  };
};
```

#### Compra Coletiva
```typescript
// Descontos por volume para a rede
interface CollectivePurchase {
  tenant_id: string;
  product_id: string;
  total_quantity: number;
  participating_units: Array<{
    unit_id: string;
    quantity: number;
  }>;
  supplier_id: string;
  discount_percentage: number;
  estimated_savings: number;
}
```

---

## 🚄 FASE 5: Performance e Otimização

### 1. Database Optimization

#### Particionamento por Tenant
```sql
-- Particionar appointments por tenant_id para escala
CREATE TABLE appointments_partitioned (
  LIKE appointments INCLUDING ALL
) PARTITION BY LIST (tenant_id);

-- Criar partição para cada tenant
CREATE TABLE appointments_tenant_1 
  PARTITION OF appointments_partitioned 
  FOR VALUES IN ('uuid-tenant-1');

CREATE TABLE appointments_tenant_2 
  PARTITION OF appointments_partitioned 
  FOR VALUES IN ('uuid-tenant-2');
```

#### Índices Otimizados
```sql
-- Índices compostos para queries multi-tenant
CREATE INDEX idx_appts_tenant_unit_date 
  ON appointments(tenant_id, unit_id, scheduled_date);

CREATE INDEX idx_appts_tenant_status 
  ON appointments(tenant_id, status, scheduled_date);

-- Índices para consolidação
CREATE INDEX idx_franchise_tenant 
  ON franchises(tenant_id, active) 
  WHERE active = true;

-- Estatísticas parciais para agilizar agregações
CREATE STATISTICS appointments_tenant_stats 
  ON tenant_id, unit_id, status 
  FROM appointments;
```

### 2. Caching Strategy

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache de métricas consolidadas (TTL: 5 minutos)
export const getCachedMetrics = async (tenantId: string) => {
  const key = `metrics:tenant:${tenantId}`;
  const cached = await redis.get(key);
  
  if (cached) return JSON.parse(cached);
  
  const metrics = await calculateTenantMetrics(tenantId);
  await redis.setex(key, 300, JSON.stringify(metrics)); // 5 min
  
  return metrics;
};

// Cache de sessão (TTL: 1 hora)
export const cacheSession = async (userId: string, session: Session) => {
  const key = `session:${userId}`;
  await redis.setex(key, 3600, JSON.stringify(session));
};

// Invalidação de cache em mutações
export const invalidateCache = async (pattern: string) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
```

### 3. Query Optimization

```sql
-- Função otimizada para métricas consolidadas
CREATE OR REPLACE FUNCTION get_tenant_dashboard_metrics(
  _tenant_id uuid,
  _date_start date DEFAULT CURRENT_DATE - interval '30 days',
  _date_end date DEFAULT CURRENT_DATE
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- Query única com múltiplas agregações
  SELECT jsonb_build_object(
    'total_revenue', (
      SELECT COALESCE(SUM(s.price), 0)
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.tenant_id = _tenant_id
        AND a.status = 'completed'
        AND a.scheduled_date BETWEEN _date_start AND _date_end
    ),
    'total_appointments', (
      SELECT COUNT(*)
      FROM appointments
      WHERE tenant_id = _tenant_id
        AND scheduled_date BETWEEN _date_start AND _date_end
    ),
    'active_units', (
      SELECT COUNT(*)
      FROM pet_shops
      WHERE tenant_id = _tenant_id
        AND active = true
    ),
    'top_performing_units', (
      SELECT jsonb_agg(unit_metrics)
      FROM (
        SELECT 
          ps.name,
          ps.id,
          COALESCE(SUM(s.price), 0) as revenue,
          COUNT(a.id) as appointments
        FROM pet_shops ps
        LEFT JOIN appointments a ON a.unit_id = ps.id
          AND a.status = 'completed'
          AND a.scheduled_date BETWEEN _date_start AND _date_end
        LEFT JOIN services s ON s.id = a.service_id
        WHERE ps.tenant_id = _tenant_id
        GROUP BY ps.id, ps.name
        ORDER BY revenue DESC
        LIMIT 10
      ) unit_metrics
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

### 4. Real-Time com Supabase

```typescript
// hooks/useRealtimeTenantMetrics.ts
export const useRealtimeTenantMetrics = (tenantId: string) => {
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  
  useEffect(() => {
    // Inscrever em mudanças relevantes
    const channel = supabase
      .channel(`tenant-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('Appointment changed:', payload);
          // Revalidar métricas
          queryClient.invalidateQueries(['tenant-metrics', tenantId]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);
  
  return metrics;
};
```

---

## 💰 FASE 6: Modelo de Monetização

### Planos de Assinatura

```typescript
interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'annual';
  features: Feature[];
  limits: Limits;
}

const plans: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 297, // por unidade/mês
    billing_cycle: 'monthly',
    features: [
      'Agendamentos ilimitados',
      'Gestão de clientes e pets',
      'Estoque básico',
      'Relatórios simples',
      'Suporte por email',
    ],
    limits: {
      max_units: 1,
      max_employees: 5,
      max_services: 20,
      storage_gb: 5,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 497, // por unidade/mês
    billing_cycle: 'monthly',
    features: [
      'Tudo do Starter +',
      'Dashboard consolidado (até 5 unidades)',
      'Relatórios avançados',
      'WhatsApp integrado',
      'Suporte prioritário',
    ],
    limits: {
      max_units: 5,
      max_employees: 25,
      max_services: 50,
      storage_gb: 20,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise (Franquias)',
    price: null, // sob consulta
    billing_cycle: 'annual',
    features: [
      'Tudo do Professional +',
      'Unidades ilimitadas',
      'Gestão de royalties',
      'BI avançado com ML',
      'Compliance e auditoria',
      'Padrões de marca',
      'API dedicada',
      'Suporte 24/7',
      'Gerente de conta dedicado',
    ],
    limits: {
      max_units: -1, // ilimitado
      max_employees: -1,
      max_services: -1,
      storage_gb: -1,
    },
  },
];
```

### Add-ons (Módulos Premium)

```typescript
interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  available_for: string[]; // planos que podem contratar
}

const addons: Addon[] = [
  {
    id: 'advanced_bi',
    name: 'BI Avançado com ML',
    description: 'Previsão de demanda, análise preditiva e insights acionáveis',
    price: 197,
    available_for: ['professional', 'enterprise'],
  },
  {
    id: 'marketing_automation',
    name: 'Automação de Marketing',
    description: 'Campanhas automáticas, segmentação e CRM avançado',
    price: 147,
    available_for: ['professional', 'enterprise'],
  },
  {
    id: 'mobile_app',
    name: 'App Mobile Personalizado',
    description: 'App white-label com sua marca para clientes',
    price: 497,
    available_for: ['enterprise'],
  },
  {
    id: 'api_access',
    name: 'Acesso API',
    description: 'Integrações customizadas via REST API',
    price: 297,
    available_for: ['professional', 'enterprise'],
  },
];
```

### Calculadora de Preço Dinâmica

```typescript
// Preço baseado em volume para franquias
const calculateEnterprisePrice = (
  numUnits: number,
  numEmployees: number,
  addons: string[]
) => {
  // Base por unidade com desconto progressivo
  let pricePerUnit = 497;
  
  if (numUnits >= 10) pricePerUnit = 397; // -20%
  if (numUnits >= 25) pricePerUnit = 347; // -30%
  if (numUnits >= 50) pricePerUnit = 297; // -40%
  
  const basePrice = pricePerUnit * numUnits;
  
  // Adicionar custos de add-ons
  const addonsPrice = addons.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);
  
  return {
    monthly: basePrice + addonsPrice,
    annual: (basePrice + addonsPrice) * 12 * 0.85, // 15% desconto anual
    savings_annual: (basePrice + addonsPrice) * 12 * 0.15,
  };
};
```

### Onboarding de Novas Franquias

```typescript
// Edge Function: Criar nova franquia
export default async (req: Request) => {
  const { 
    tenant_id, 
    franchise_name, 
    owner_email,
    plan_id,
    initial_units 
  } = await req.json();
  
  // 1. Criar usuário para o franqueado
  const { data: user } = await supabase.auth.admin.createUser({
    email: owner_email,
    email_confirm: true,
    user_metadata: {
      full_name: franchise_name,
      user_type: 'franchise_owner',
    },
  });
  
  // 2. Criar franquia
  const { data: franchise } = await supabase
    .from('franchises')
    .insert({
      tenant_id,
      name: franchise_name,
      owner_id: user.user.id,
      code: generateFranchiseCode(tenant_id),
      royalty_config: getDefaultRoyaltyConfig(tenant_id),
    })
    .select()
    .single();
  
  // 3. Criar unidades iniciais
  for (let i = 0; i < initial_units; i++) {
    await supabase.from('pet_shops').insert({
      tenant_id,
      franchise_id: franchise.id,
      owner_id: user.user.id,
      name: `${franchise_name} - Unidade ${i + 1}`,
      unit_code: `${franchise.code}-${String(i + 1).padStart(3, '0')}`,
    });
  }
  
  // 4. Clonar padrões da franqueadora
  await cloneBrandStandards(tenant_id, franchise.id);
  
  // 5. Criar assinatura
  await supabase.from('subscriptions').insert({
    tenant_id,
    franchise_id: franchise.id,
    plan_id,
    status: 'trial', // 30 dias de trial
    trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  
  // 6. Enviar email de boas-vindas
  await sendWelcomeEmail(owner_email, {
    franchise_name,
    login_url: `${process.env.APP_URL}/auth`,
    temp_password: '...',
  });
  
  return new Response(JSON.stringify({ 
    success: true, 
    franchise_id: franchise.id 
  }));
};
```

---

## 🗓️ FASE 7: Roadmap de Implementação

### **Trimestre 1: MVP Multi-Tenant** (3 meses)

#### Sprint 1-2: Fundação (4 semanas)
- [x] ✅ Sistema atual funcionando (já implementado)
- [ ] 🔧 Criar hierarquia: tenants → franchises → units
- [ ] 🔐 Implementar multi-tenant RLS
- [ ] 👤 Adicionar roles: tenant_admin, franchise_owner, unit_manager
- [ ] 🧪 Testes de isolamento de dados

#### Sprint 3-4: Dashboards Básicos (4 semanas)
- [ ] 📊 Tenant Dashboard (métricas consolidadas)
- [ ] 🏬 Franchise Dashboard (visão da franquia)
- [ ] 🔄 Unit Switcher component
- [ ] 📈 Relatórios consolidados básicos
- [ ] 🧪 Testes E2E

#### Sprint 5-6: Onboarding (4 semanas)
- [ ] 📝 Fluxo de criação de franquias
- [ ] 🚀 Wizard de setup de unidades
- [ ] 📧 Emails automáticos
- [ ] 🎓 Tutorial interativo
- [ ] 📚 Documentação

**Entregável:** Sistema funcional multi-tenant com dashboards básicos

---

### **Trimestre 2: Funcionalidades Core** (3 meses)

#### Sprint 7-8: Royalties (4 semanas)
- [ ] 💰 Tabela e models de royalties
- [ ] 🧮 Função de cálculo automático
- [ ] 📊 Dashboard de royalties (tenant)
- [ ] 📅 Agendamento mensal via cron
- [ ] 📧 Notificações de vencimento

#### Sprint 9-10: Compliance (4 semanas)
- [ ] 📚 Sistema de brand standards
- [ ] ✅ Checklists de procedimentos
- [ ] 🔍 Auditorias e scoring
- [ ] ⚠️ Alertas de não-conformidade
- [ ] 📊 Dashboard de compliance

#### Sprint 11-12: Estoque em Rede (4 semanas)
- [ ] 📦 Transferência entre unidades
- [ ] 🚚 Rastreamento de transferências
- [ ] 💵 Sistema de compra coletiva
- [ ] 📊 Consolidação de inventário
- [ ] 🔔 Alertas inteligentes

**Entregável:** Sistema completo para operação de franquias

---

### **Trimestre 3: BI e Otimização** (3 meses)

#### Sprint 13-14: BI Avançado (4 semanas)
- [ ] 📊 Dashboards personalizáveis
- [ ] 📈 Gráficos comparativos avançados
- [ ] 🎯 Drill-down em métricas
- [ ] 📱 Export de relatórios (PDF, Excel)
- [ ] 🔄 Refresh automático

#### Sprint 15-16: Machine Learning (4 semanas)
- [ ] 🤖 Previsão de demanda (Lovable AI)
- [ ] 💡 Insights acionáveis
- [ ] 🎯 Recomendações personalizadas
- [ ] 📊 Análise de tendências
- [ ] 🧪 A/B testing

#### Sprint 17-18: Performance (4 semanas)
- [ ] 🚀 Implementar Redis cache
- [ ] 📊 Particionamento de tabelas grandes
- [ ] ⚡ Otimizar queries críticas
- [ ] 📈 Monitoring (Sentry, LogRocket)
- [ ] 🧪 Load testing

**Entregável:** Sistema otimizado com BI avançado

---

### **Trimestre 4: Premium e Expansão** (3 meses)

#### Sprint 19-20: Mobile App (4 semanas)
- [ ] 📱 App React Native para franqueados
- [ ] 📊 Dashboard mobile
- [ ] 🔔 Push notifications
- [ ] 📸 Scanner de código de barras
- [ ] 🔄 Sync offline

#### Sprint 21-22: Automação Marketing (4 semanas)
- [ ] 📧 Campanhas automáticas
- [ ] 🎯 Segmentação avançada
- [ ] 📊 CRM integrado
- [ ] 💬 WhatsApp Business API
- [ ] 📈 Analytics de campanhas

#### Sprint 23-24: API e Integrações (4 semanas)
- [ ] 🔌 REST API pública
- [ ] 📚 Documentação Swagger
- [ ] 🔐 API Keys e rate limiting
- [ ] 🔗 Webhooks
- [ ] 🧩 Integrações (contábil, fiscal, etc)

**Entregável:** Plataforma completa enterprise

---

## 📊 Métricas de Sucesso (KPIs)

### Para o Produto
- 📈 **Crescimento de Usuários**: +50% ao ano
- 💰 **MRR (Monthly Recurring Revenue)**: R$ 500K no ano 1
- 🎯 **Churn Rate**: < 5% ao mês
- ⭐ **NPS (Net Promoter Score)**: > 60
- ⚡ **Uptime**: > 99.9%

### Para os Clientes (Franqueadoras)
- 📊 **ROI em 6 meses**: Economia de 30% em gestão
- ⏱️ **Tempo de Onboarding**: < 2 semanas
- 🎓 **Taxa de Adoção**: > 90% dos funcionários usando
- 📈 **Aumento de Receita**: +20% em 1 ano
- ⚙️ **Eficiência Operacional**: -40% tempo em tarefas admin

---

## 💡 Diferenciais Competitivos

### vs LoopVet

| Funcionalidade | LoopVet | Nossa Plataforma |
|----------------|---------|------------------|
| Gestão Multi-Unidade | ⚠️ Básico | ✅ Avançado |
| Royalties Automáticos | ❌ Não | ✅ Sim |
| BI com ML | ❌ Não | ✅ Sim |
| Compliance e Auditoria | ❌ Não | ✅ Sim |
| API Pública | ⚠️ Limitada | ✅ Completa |
| App Mobile Franqueado | ❌ Não | ✅ Sim |
| Preço para Franquias | 💰 Alto | 💰 Competitivo |

### Proposta de Valor Única

**"A única plataforma desenhada especificamente para franquias de pet shop crescerem de forma escalável, mantendo o padrão de qualidade em todas as unidades."**

---

## 🚨 Riscos e Mitigações

### Riscos Técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Performance em escala | Alto | Média | Particionamento, cache, load testing |
| Complexidade multi-tenant | Alto | Alta | RLS robusto, testes extensivos |
| Segurança de dados | Crítico | Baixa | Auditorias, pen testing, LGPD |
| Bugs na migração | Médio | Média | Feature flags, rollback plan |

### Riscos de Negócio

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Baixa adoção inicial | Alto | Média | MVP focado, early adopters, feedback loops |
| Concorrência | Médio | Alta | Inovação contínua, lock-in por valor |
| Churn alto | Alto | Média | Onboarding excelente, suporte proativo |
| Precificação inadequada | Alto | Média | Pesquisa de mercado, pilotos |

---

## ✅ Checklist de Lançamento

### Pré-Lançamento
- [ ] Arquitetura revisada e aprovada
- [ ] MVP desenvolvido e testado
- [ ] 5 franquias piloto confirmadas
- [ ] Documentação completa
- [ ] Treinamento da equipe de suporte
- [ ] Plano de marketing definido
- [ ] Infraestrutura escalável (auto-scaling)
- [ ] Monitoramento configurado
- [ ] Backup automático ativo
- [ ] Conformidade LGPD

### Lançamento Soft (Beta)
- [ ] Onboarding de 10 franquias beta
- [ ] Coleta de feedback estruturada
- [ ] Ajustes baseados em uso real
- [ ] Casos de sucesso documentados
- [ ] Testimonials gravados

### Lançamento Público
- [ ] Press release
- [ ] Website atualizado
- [ ] Campanhas de marketing ativas
- [ ] Webinars de demonstração
- [ ] Parcerias com consultorias de franquias
- [ ] Presença em eventos do setor

---

## 📚 Recursos Adicionais

### Documentação Técnica
- [ ] Architecture Decision Records (ADRs)
- [ ] API Documentation (Swagger)
- [ ] Database Schema Documentation
- [ ] Deployment Guide
- [ ] Security Best Practices

### Para Usuários
- [ ] User Guide (Franqueadora)
- [ ] User Guide (Franqueado)
- [ ] User Guide (Unidade)
- [ ] Video Tutorials
- [ ] FAQ Detalhado
- [ ] Best Practices

### Para Equipe
- [ ] Onboarding de Desenvolvedores
- [ ] Code Standards
- [ ] Git Workflow
- [ ] Testing Guidelines
- [ ] On-call Procedures

---

## 🎯 Conclusão

Esta proposta transforma o sistema atual em uma plataforma enterprise multi-tenant que:

✅ **Supera o LoopVet** em funcionalidades de franquia  
✅ **Escalável** para centenas de unidades  
✅ **Rentável** com modelo de assinatura recorrente  
✅ **Diferenciado** com BI, ML e automação  
✅ **Executável** em 12 meses de desenvolvimento  

**Próximo Passo:** Aprovar roadmap e iniciar Sprint 1 (Fundação Multi-Tenant)

---

*Documento criado: 2025-10-31*  
*Versão: 1.0*  
*Autor: Sistema de Planejamento Estratégico*
