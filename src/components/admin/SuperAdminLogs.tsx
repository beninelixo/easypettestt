import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ErrorTipCard } from "./ErrorTipCard";
import { getErrorTipFromMessage } from "@/lib/error-tips";

interface SystemLog {
  id: string;
  module: string;
  log_type: string;
  message: string;
  details: any;
  created_at: string;
}

export const SuperAdminLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [logType, setLogType] = useState("all");
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, [logType]);

  const loadLogs = async () => {
    try {
      let query = supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logType !== "all") {
        query = query.eq("log_type", logType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error("Error loading logs:", error);
      toast({
        title: "Erro ao carregar logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-500/10">Aviso</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10">Sucesso</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const toggleTip = (logId: string) => {
    setExpandedTips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs do Sistema</CardTitle>
        <CardDescription>
          Visualize todos os logs e eventos do sistema com dicas de resolução
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={logType} onValueChange={setLogType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de log" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="error">Erros</SelectItem>
              <SelectItem value="warning">Avisos</SelectItem>
              <SelectItem value="success">Sucessos</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => {
              const tip = (log.log_type === 'error' || log.log_type === 'warning') 
                ? getErrorTipFromMessage(log.message) 
                : null;
              
              return (
                <Card key={log.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getLogIcon(log.log_type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.module}</span>
                            {getLogBadge(log.log_type)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.message}</p>
                          {log.details && (
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                          
                          {/* Error Tip for errors and warnings */}
                          {tip && (
                            <div className="mt-3">
                              <ErrorTipCard 
                                tip={tip} 
                                defaultExpanded={expandedTips.has(log.id)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum log encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
