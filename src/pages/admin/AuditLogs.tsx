import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, Search, Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function AuditLogs() {
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState<string>("7");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', dateFilter, actionFilter, resultFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(full_name, user_code)
        `)
        .eq('operation', 'GOD_MODE_ACTION')
        .order('created_at', { ascending: false });

      // Filtro de data
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        query = query.gte('created_at', dateLimit.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filtrar logs localmente por ação e resultado
  const filteredLogs = logs?.filter(log => {
    const actionData = log.new_data as any;
    
    // Filtro de ação
    if (actionFilter !== 'all' && actionData?.action !== actionFilter) {
      return false;
    }
    
    // Filtro de resultado
    if (resultFilter === 'success' && !actionData?.success) {
      return false;
    }
    if (resultFilter === 'error' && actionData?.success) {
      return false;
    }
    
    // Filtro de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const userName = (log.user as any)?.full_name?.toLowerCase() || '';
      const action = actionData?.action?.toLowerCase() || '';
      
      if (!userName.includes(searchLower) && !action.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  }) || [];

  const getActionName = (action: string): string => {
    const names: Record<string, string> = {
      cleanup: 'Limpeza de Dados',
      backup: 'Backup Completo',
      ai_analysis: 'Análise com IA',
      fix_rls: 'Verificação RLS',
      fix_duplicates: 'Detecção de Duplicatas',
    };
    return names[action] || action;
  };

  const getResultBadge = (success: boolean) => {
    if (success) {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Sucesso
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Erro
      </Badge>
    );
  };

  const exportToCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar com os filtros atuais",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Data/Hora", "Usuário", "Código", "Ação", "Resultado", "Detalhes"];
    const rows = filteredLogs.map(log => {
      const actionData = log.new_data as any;
      const user = log.user as any;
      
      return [
        format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
        user?.full_name || 'Sistema',
        user?.user_code || '-',
        getActionName(actionData?.action || ''),
        actionData?.success ? 'Sucesso' : 'Erro',
        actionData?.details ? JSON.stringify(actionData.details) : '-'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída!",
      description: `${filteredLogs.length} registros exportados com sucesso`,
    });
  };

  const stats = {
    total: filteredLogs?.length || 0,
    success: filteredLogs?.filter(log => (log.new_data as any)?.success).length || 0,
    errors: filteredLogs?.filter(log => !(log.new_data as any)?.success).length || 0,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Logs de Auditoria - Modo Deus
          </h1>
          <p className="text-muted-foreground mt-2">
            Histórico completo de todas as ações administrativas executadas
          </p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bem Sucedidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.errors / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Últimas 24 horas</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Ação</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="cleanup">Limpeza de Dados</SelectItem>
                  <SelectItem value="backup">Backup Completo</SelectItem>
                  <SelectItem value="ai_analysis">Análise com IA</SelectItem>
                  <SelectItem value="fix_rls">Verificação RLS</SelectItem>
                  <SelectItem value="fix_duplicates">Detecção de Duplicatas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Resultado</label>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Usuário ou ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoria ({filteredLogs?.length || 0})</CardTitle>
          <CardDescription>
            Histórico detalhado de todas as operações administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs && filteredLogs.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const actionData = log.new_data as any;
                    const user = log.user as any;
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user?.full_name || 'Sistema'}</p>
                            <p className="text-xs text-muted-foreground">{user?.user_code || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getActionName(actionData?.action || '')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getResultBadge(actionData?.success)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {actionData?.details && (
                            <details className="cursor-pointer">
                              <summary className="text-xs text-muted-foreground hover:text-foreground">
                                Ver detalhes
                              </summary>
                              <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto max-h-40">
                                {JSON.stringify(actionData.details, null, 2)}
                              </pre>
                            </details>
                          )}
                          {actionData?.error && (
                            <p className="text-xs text-destructive mt-1">
                              Erro: {actionData.error}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum log encontrado</p>
              <p className="text-sm mt-2">
                Não há registros de auditoria com os filtros selecionados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
