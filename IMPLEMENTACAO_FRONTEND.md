# 🎨 Implementação Frontend Multi-Tenant
## Guia Prático de Desenvolvimento

---

## 📁 Estrutura de Pastas Proposta

```
src/
├── features/                    # Features organizadas por contexto
│   ├── tenant/                  # Dashboard da Franqueadora
│   │   ├── components/
│   │   │   ├── TenantOverview.tsx
│   │   │   ├── FranchisesList.tsx
│   │   │   ├── UnitsMap.tsx
│   │   │   └── RoyaltiesSummary.tsx
│   │   ├── pages/
│   │   │   ├── TenantDashboard.tsx
│   │   │   ├── ManageFranchises.tsx
│   │   │   ├── Royalties.tsx
│   │   │   ├── Compliance.tsx
│   │   │   └── BrandStandards.tsx
│   │   └── hooks/
│   │       ├── useTenantMetrics.ts
│   │       ├── useFranchises.ts
│   │       └── useRoyalties.ts
│   │
│   ├── franchise/               # Dashboard do Franqueado
│   │   ├── components/
│   │   │   ├── FranchiseOverview.tsx
│   │   │   ├── UnitsList.tsx
│   │   │   ├── PerformanceComparison.tsx
│   │   │   └── StockTransfer.tsx
│   │   ├── pages/
│   │   │   ├── FranchiseDashboard.tsx
│   │   │   ├── ManageUnits.tsx
│   │   │   ├── MyRoyalties.tsx
│   │   │   └── ComplianceView.tsx
│   │   └── hooks/
│   │       ├── useFranchiseMetrics.ts
│   │       └── useUnits.ts
│   │
│   ├── unit/                    # Dashboard da Unidade (existente)
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   │
│   ├── appointments/            # Módulo de Agendamentos
│   ├── clients/                 # Módulo de Clientes
│   ├── inventory/               # Módulo de Estoque
│   └── reports/                 # Módulo de Relatórios
│
├── shared/                      # Componentes compartilhados
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TenantLayout.tsx
│   │   │   ├── FranchiseLayout.tsx
│   │   │   └── UnitLayout.tsx
│   │   ├── navigation/
│   │   │   ├── MultiLevelSidebar.tsx
│   │   │   ├── UnitSwitcher.tsx
│   │   │   └── BreadcrumbNav.tsx
│   │   ├── charts/
│   │   │   ├── ConsolidatedChart.tsx
│   │   │   ├── ComparisonChart.tsx
│   │   │   └── TrendChart.tsx
│   │   └── data-display/
│   │       ├── MetricCard.tsx
│   │       ├── DataTable.tsx
│   │       └── StatusBadge.tsx
│   │
│   ├── hooks/
│   │   ├── useTenant.ts
│   │   ├── useMultiUnit.ts
│   │   ├── useConsolidated.ts
│   │   ├── usePermissions.ts
│   │   └── useRealtime.ts
│   │
│   └── utils/
│       ├── formatters.ts
│       ├── calculations.ts
│       └── validators.ts
│
├── lib/                         # Bibliotecas core
│   ├── tenant-context.tsx
│   ├── rbac.ts
│   ├── cache-strategy.ts
│   └── api-client.ts
│
├── types/                       # TypeScript types
│   ├── tenant.ts
│   ├── franchise.ts
│   ├── unit.ts
│   └── database.ts
│
└── App.tsx
```

---

## 🎯 Componentes Chave

### 1. Unit Switcher (Seletor de Unidades)

```typescript
// shared/components/navigation/UnitSwitcher.tsx
import { useState } from 'react';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMultiUnit } from '@/shared/hooks/useMultiUnit';

export const UnitSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { 
    currentUnit, 
    franchises, 
    switchUnit,
    loading 
  } = useMultiUnit();

  if (loading) {
    return <div className="h-10 w-[240px] animate-pulse bg-muted rounded" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{currentUnit?.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Buscar unidade..." />
          <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
          <CommandList>
            {franchises.map((franchise) => (
              <CommandGroup 
                key={franchise.id} 
                heading={franchise.name}
              >
                {franchise.units.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    value={unit.id}
                    onSelect={() => {
                      switchUnit(unit.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currentUnit?.id === unit.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{unit.name}</span>
                      {unit.alerts > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {unit.alerts}
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem onSelect={() => navigate('/franchises/new')}>
              <Building2 className="mr-2 h-4 w-4" />
              Adicionar Unidade
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
```

### 2. Consolidated Filters (Filtros Consolidados)

```typescript
// shared/components/data-display/ConsolidatedFilters.tsx
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsolidatedFiltersProps {
  franchises: Franchise[];
  units: Unit[];
  onFiltersChange: (filters: FilterState) => void;
}

export const ConsolidatedFilters = ({
  franchises,
  units,
  onFiltersChange,
}: ConsolidatedFiltersProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'none' | 'previous' | 'average'>('none');

  const handleApplyFilters = () => {
    onFiltersChange({
      dateRange,
      franchises: selectedFranchises,
      units: selectedUnits,
      comparisonMode,
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[280px] justify-start text-left">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'dd MMM yyyy', { locale: ptBR })} -{' '}
                  {format(dateRange.to, 'dd MMM yyyy', { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, 'dd MMM yyyy', { locale: ptBR })
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      {/* Franchise Filter */}
      <Select
        value={selectedFranchises[0]}
        onValueChange={(value) => setSelectedFranchises(value === 'all' ? [] : [value])}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todas as franquias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as franquias</SelectItem>
          {franchises.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Unit Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Unidades ({selectedUnits.length || 'Todas'})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px]">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-units"
                checked={selectedUnits.length === 0}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedUnits([]);
                }}
              />
              <Label htmlFor="all-units">Todas as unidades</Label>
            </div>
            {units.map((unit) => (
              <div key={unit.id} className="flex items-center space-x-2">
                <Checkbox
                  id={unit.id}
                  checked={selectedUnits.includes(unit.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUnits([...selectedUnits, unit.id]);
                    } else {
                      setSelectedUnits(selectedUnits.filter((id) => id !== unit.id));
                    }
                  }}
                />
                <Label htmlFor={unit.id}>{unit.name}</Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Comparison Mode */}
      <Select value={comparisonMode} onValueChange={(v: any) => setComparisonMode(v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem comparação</SelectItem>
          <SelectItem value="previous">vs Período Anterior</SelectItem>
          <SelectItem value="average">vs Média da Rede</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleApplyFilters}>Aplicar</Button>
    </div>
  );
};
```

### 3. Tenant Dashboard (Dashboard da Franqueadora)

```typescript
// features/tenant/pages/TenantDashboard.tsx
import { useState } from 'react';
import { useTenantMetrics } from '../hooks/useTenantMetrics';
import { useFranchises } from '../hooks/useFranchises';
import { ConsolidatedFilters } from '@/shared/components/data-display/ConsolidatedFilters';
import { MetricCard } from '@/shared/components/data-display/MetricCard';
import { TrendChart } from '@/shared/components/charts/TrendChart';
import { UnitsMap } from '../components/UnitsMap';
import { TopPerformers } from '../components/TopPerformers';
import { AlertsPanel } from '../components/AlertsPanel';
import { TrendingUp, Building2, DollarSign, Users } from 'lucide-react';

export const TenantDashboard = () => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: getDefaultDateRange(),
    franchises: [],
    units: [],
    comparisonMode: 'none',
  });

  const { data: metrics, isLoading } = useTenantMetrics(filters);
  const { data: franchises } = useFranchises();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Master</h1>
          <p className="text-muted-foreground">
            Visão consolidada de toda a rede
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportReport()}>
            Exportar Relatório
          </Button>
          <Button onClick={() => navigate('/tenant/franchises/new')}>
            Nova Franquia
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ConsolidatedFilters
        franchises={franchises || []}
        units={getAllUnits(franchises)}
        onFiltersChange={setFilters}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Franquias Ativas"
          value={metrics?.totalFranchises || 0}
          icon={Building2}
          trend={{
            value: metrics?.franchisesGrowth || 0,
            isPositive: (metrics?.franchisesGrowth || 0) > 0,
          }}
        />
        <MetricCard
          title="Unidades em Operação"
          value={metrics?.totalUnits || 0}
          icon={Building2}
          trend={{
            value: metrics?.unitsGrowth || 0,
            isPositive: (metrics?.unitsGrowth || 0) > 0,
          }}
        />
        <MetricCard
          title="Faturamento Total"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          icon={DollarSign}
          trend={{
            value: metrics?.revenueGrowth || 0,
            isPositive: (metrics?.revenueGrowth || 0) > 0,
          }}
        />
        <MetricCard
          title="Royalties do Mês"
          value={formatCurrency(metrics?.totalRoyalties || 0)}
          icon={TrendingUp}
          subtitle={`${metrics?.royaltiesPaid || 0}/${metrics?.totalRoyaltiesDue || 0} pagos`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="Evolução de Faturamento"
          data={metrics?.revenueHistory || []}
          comparison={filters.comparisonMode}
        />
        <TrendChart
          title="Agendamentos por Período"
          data={metrics?.appointmentsHistory || []}
          comparison={filters.comparisonMode}
        />
      </div>

      {/* Map + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnitsMap units={metrics?.unitsWithLocation || []} />
        <TopPerformers units={metrics?.topUnits || []} />
      </div>

      {/* Alerts */}
      <AlertsPanel alerts={metrics?.alerts || []} />
    </div>
  );
};
```

### 4. Hooks Customizados

```typescript
// shared/hooks/useMultiUnit.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/lib/tenant-context';

export const useMultiUnit = () => {
  const { tenantId } = useTenant();
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);

  // Buscar todas as franquias e unidades do tenant
  const { data: franchises, isLoading } = useQuery({
    queryKey: ['franchises', tenantId],
    queryFn: async () => {
      const { data } = await supabase
        .from('franchises')
        .select(`
          *,
          units:pet_shops(*)
        `)
        .eq('tenant_id', tenantId)
        .eq('active', true);
      
      return data;
    },
    enabled: !!tenantId,
  });

  // Carregar unidade atual do localStorage
  useEffect(() => {
    const savedUnitId = localStorage.getItem('current_unit_id');
    if (savedUnitId && franchises) {
      const unit = franchises
        .flatMap(f => f.units)
        .find(u => u.id === savedUnitId);
      if (unit) setCurrentUnit(unit);
    } else if (franchises && franchises[0]?.units[0]) {
      setCurrentUnit(franchises[0].units[0]);
    }
  }, [franchises]);

  const switchUnit = (unitId: string) => {
    const unit = franchises
      ?.flatMap(f => f.units)
      .find(u => u.id === unitId);
    
    if (unit) {
      setCurrentUnit(unit);
      localStorage.setItem('current_unit_id', unitId);
    }
  };

  return {
    currentUnit,
    franchises,
    switchUnit,
    loading: isLoading,
  };
};

// shared/hooks/useConsolidated.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConsolidatedFilters {
  tenant_id: string;
  franchise_ids?: string[];
  unit_ids?: string[];
  date_start: string;
  date_end: string;
}

export const useConsolidatedMetrics = (filters: ConsolidatedFilters) => {
  return useQuery({
    queryKey: ['consolidated-metrics', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_consolidated_metrics', {
        _tenant_id: filters.tenant_id,
        _franchise_ids: filters.franchise_ids || null,
        _unit_ids: filters.unit_ids || null,
        _date_start: filters.date_start,
        _date_end: filters.date_end,
      });
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
```

---

Documento técnico completo gerado. Próximos passos: revisar e iniciar implementação da Fase 1!
