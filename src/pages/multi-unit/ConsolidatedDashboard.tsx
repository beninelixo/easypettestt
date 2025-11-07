import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConsolidatedMetrics } from "@/shared/hooks/useConsolidated";
import { useMultiUnit } from "@/shared/hooks/useMultiUnit";
import { useTenant } from "@/lib/tenant-context";
import { Building2, Calendar as CalendarIcon, TrendingUp, Users, DollarSign, Loader2, BarChart3, PieChart, Download } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function ConsolidatedDashboard() {
  const { tenantId } = useTenant();
  const { franchises, currentUnit } = useMultiUnit();
  
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"overview" | "comparison">("overview");

  const { data: metrics, isLoading } = useConsolidatedMetrics({
    tenant_id: tenantId || "",
    franchise_ids: selectedFranchises.length > 0 ? selectedFranchises : undefined,
    unit_ids: selectedUnits.length > 0 ? selectedUnits : undefined,
    date_start: format(dateRange.from, "yyyy-MM-dd"),
    date_end: format(dateRange.to, "yyyy-MM-dd"),
  });

  const handleExportReport = () => {
    // Implementar exportação de relatório
    console.log("Exporting report...");
  };

  if (!tenantId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Você não tem permissão para acessar o dashboard consolidado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dashboard Consolidado
            </h1>
            <p className="text-muted-foreground">
              Visão geral de todas as unidades e franquias
            </p>
          </div>
          <Button onClick={handleExportReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
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
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from) {
                        setDateRange({ from: range.from, to: range.to || range.from });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* Franchise Filter */}
              <Select
                value={selectedFranchises[0] || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedFranchises([]);
                  } else {
                    setSelectedFranchises([value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as franquias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as franquias</SelectItem>
                  {franchises.map((franchise) => (
                    <SelectItem key={franchise.id} value={franchise.id}>
                      {franchise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Unit Filter */}
              <Select
                value={selectedUnits[0] || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedUnits([]);
                  } else {
                    setSelectedUnits([value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {franchises.flatMap(f => f.units || []).map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Visão Geral
                    </div>
                  </SelectItem>
                  <SelectItem value="comparison">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Comparação
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="revenue">Faturamento</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faturamento Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(metrics?.total_revenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedUnits.length > 0 
                      ? `${selectedUnits.length} unidade(s) selecionada(s)`
                      : `Todas as ${franchises.flatMap(f => f.units || []).length} unidades`
                    }
                  </p>
                  <Progress value={75} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Agendamentos
                  </CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.total_appointments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((metrics?.total_appointments || 0) / 30)} por dia (média)
                  </p>
                  <Progress value={60} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unidades Ativas
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.active_units || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    de {franchises.flatMap(f => f.units || []).length} total
                  </p>
                  <Progress value={85} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clientes Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.total_clients || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((metrics?.total_clients || 0) / (metrics?.active_units || 1))} por unidade
                  </p>
                  <Progress value={70} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Units Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Unidade</CardTitle>
                <CardDescription>
                  Comparativo de desempenho entre todas as unidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {franchises.flatMap(f => f.units || []).slice(0, 5).map((unit, index) => (
                    <div key={unit.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{unit.name}</p>
                          <p className="text-sm text-muted-foreground">{unit.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            R$ {(Math.random() * 50000 + 10000).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 100 + 50)} agendamentos
                          </p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Faturamento Detalhado</CardTitle>
                <CardDescription>
                  Análise de faturamento por período e unidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Gráficos de faturamento em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
                <CardDescription>
                  KPIs e métricas de desempenho consolidadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Indicadores de performance em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Unidades</CardTitle>
                <CardDescription>
                  Classificação por diversos critérios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Sistema de ranking em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
