import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAccessAudit, type AccessAuditLog } from "@/hooks/useAccessAudit";
import { Shield, Search, RefreshCw, Download, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AccessAuditViewerProps {
  petShopId?: string;
  userId?: string;
  autoLoad?: boolean;
}

const moduleLabels: Record<string, string> = {
  dashboard: "Dashboard",
  appointments: "Agendamentos",
  clients: "Clientes",
  pets: "Pets",
  services: "Serviços",
  products: "Produtos",
  inventory: "Estoque",
  financial: "Financeiro",
  reports: "Relatórios",
  marketing: "Marketing",
  settings: "Configurações",
  employees: "Funcionários",
};

const actionLabels: Record<string, string> = {
  view: "Visualizar",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
  manage: "Gerenciar",
};

export const AccessAuditViewer = ({
  petShopId,
  userId,
  autoLoad = true,
}: AccessAuditViewerProps) => {
  const { logs, loading, loadLogs, getStatsByModule, getStatsByUser } = useAccessAudit();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterSuccess, setFilterSuccess] = useState<string>("all");

  useEffect(() => {
    if (autoLoad) {
      handleLoad();
    }
  }, [autoLoad, petShopId, userId]);

  const handleLoad = () => {
    loadLogs({
      petShopId,
      userId,
      limit: 200,
    });
  };

  const handleExport = () => {
    const csv = [
      ["Data/Hora", "Usuário", "Módulo", "Ação", "Sucesso", "IP", "Detalhes"],
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
        log.profiles?.full_name || "Desconhecido",
        moduleLabels[log.module] || log.module,
        actionLabels[log.action] || log.action,
        log.success ? "Sim" : "Não",
        log.ip_address || "-",
        log.resource_type || "-",
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
    link.click();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = filterModule === "all" || log.module === filterModule;
    const matchesSuccess = filterSuccess === "all" || 
      (filterSuccess === "success" && log.success) ||
      (filterSuccess === "error" && !log.success);

    return matchesSearch && matchesModule && matchesSuccess;
  });

  const stats = getStatsByModule();
  const userStats = getStatsByUser();

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos {logs.length} registros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(l => l.success).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((logs.filter(l => l.success).length / logs.length) * 100 || 0).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(l => !l.success).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((logs.filter(l => !l.success).length / logs.length) * 100 || 0).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Logs de Auditoria
              </CardTitle>
              <CardDescription>
                Histórico de acessos e ações no sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={handleLoad} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os módulos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os módulos</SelectItem>
                {Object.entries(moduleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSuccess} onValueChange={setFilterSuccess}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="success">Apenas sucessos</SelectItem>
                <SelectItem value="error">Apenas falhas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Logs */}
          <ScrollArea className="h-[500px] w-full rounded-md border">
            <div className="p-4 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum log encontrado
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {log.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {log.profiles?.full_name || "Usuário desconhecido"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {actionLabels[log.action]} • {moduleLabels[log.module]}
                        </Badge>
                        {log.resource_type && (
                          <Badge variant="secondary" className="text-xs">
                            {log.resource_type}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </span>
                        {log.ip_address && (
                          <span>IP: {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="text-sm text-muted-foreground">
            Exibindo {filteredLogs.length} de {logs.length} registros
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
