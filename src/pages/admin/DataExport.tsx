import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Download, 
  Database, 
  HardDrive, 
  FileArchive, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  RefreshCw,
  FileText,
  FolderOpen
} from "lucide-react";
import JSZip from "jszip";

// Lista de todas as tabelas do database
const DATABASE_TABLES = [
  "access_audit", "admin_alerts", "admin_api_rate_limits", "admin_invites",
  "admin_notification_preferences", "appointments", "audit_logs", "auth_events_log",
  "backup_history", "backup_verifications", "blocked_ips", "brand_standards",
  "commissions", "compliance_audits", "employee_permissions", "failed_jobs",
  "franchises", "global_metrics", "impersonation_sessions", "ip_whitelist",
  "login_attempts", "loyalty_points", "loyalty_transactions", "marketing_campaigns",
  "mfa_backup_codes", "mfa_secrets", "mfa_sessions", "monitoramento_sistema",
  "notifications", "notifications_log", "password_resets", "payments",
  "permissions", "pet_photos", "pet_shops", "pets", "petshop_employees",
  "plan_features", "products", "professional_backups", "profiles",
  "role_changes_audit", "satisfaction_surveys", "security_alerts",
  "security_notifications", "services", "settings_passwords",
  "stock_movements", "structured_logs", "success_stories", "system_health_metrics",
  "system_logs", "tenants", "user_hierarchy", "user_roles",
  "webhook_endpoints", "whatsapp_settings"
];

// Lista de buckets de storage
const STORAGE_BUCKETS = [
  { name: "avatars", public: true, description: "Fotos de perfil dos usuários" },
  { name: "backups", public: false, description: "Backups do sistema" },
  { name: "blog-images", public: true, description: "Imagens do blog" },
  { name: "site-images", public: true, description: "Imagens do site" }
];

interface ExportLog {
  timestamp: Date;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

interface TableInfo {
  name: string;
  count: number | null;
  selected: boolean;
  status: "pending" | "loading" | "success" | "error";
}

interface BucketInfo {
  name: string;
  public: boolean;
  description: string;
  fileCount: number | null;
  selected: boolean;
  status: "pending" | "loading" | "success" | "error";
}

export default function DataExport() {
  const { user, isGodUser } = useAuth();
  const navigate = useNavigate();
  
  const [tables, setTables] = useState<TableInfo[]>(
    DATABASE_TABLES.map(name => ({ 
      name, 
      count: null, 
      selected: true, 
      status: "pending" 
    }))
  );
  
  const [buckets, setBuckets] = useState<BucketInfo[]>(
    STORAGE_BUCKETS.map(b => ({ 
      ...b, 
      fileCount: null, 
      selected: true, 
      status: "pending" 
    }))
  );
  
  const [logs, setLogs] = useState<ExportLog[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("");
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [exportStats, setExportStats] = useState({
    totalRecords: 0,
    totalFiles: 0,
    exportedTables: 0,
    exportedBuckets: 0,
    errors: 0
  });

  // Verificar acesso
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!isGodUser) {
      // Verificar se é admin
      const checkAdminRole = async () => {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "super_admin"])
          .single();
        
        if (!data) {
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive"
          });
          navigate("/admin/dashboard");
        }
      };
      checkAdminRole();
    }
  }, [user, isGodUser, navigate]);

  // Adicionar log
  const addLog = useCallback((message: string, type: ExportLog["type"] = "info") => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, type }]);
  }, []);

  // Carregar contagens das tabelas
  const loadTableCounts = async () => {
    setIsLoadingCounts(true);
    addLog("Carregando contagem de registros das tabelas...", "info");
    
    const updatedTables = [...tables];
    let totalRecords = 0;
    
    for (let i = 0; i < updatedTables.length; i++) {
      const table = updatedTables[i];
      try {
        const { count, error } = await supabase
          .from(table.name as any)
          .select("*", { count: "exact", head: true });
        
        if (error) {
          updatedTables[i] = { ...table, count: 0 };
        } else {
          updatedTables[i] = { ...table, count: count || 0 };
          totalRecords += count || 0;
        }
      } catch {
        updatedTables[i] = { ...table, count: 0 };
      }
      
      // Atualizar a cada 5 tabelas
      if (i % 5 === 0) {
        setTables([...updatedTables]);
      }
    }
    
    setTables(updatedTables);
    setExportStats(prev => ({ ...prev, totalRecords }));
    addLog(`Contagem concluída: ${totalRecords.toLocaleString()} registros em ${updatedTables.length} tabelas`, "success");
    setIsLoadingCounts(false);
  };

  // Carregar contagens dos buckets
  const loadBucketCounts = async () => {
    addLog("Carregando arquivos dos buckets de storage...", "info");
    
    const updatedBuckets = [...buckets];
    let totalFiles = 0;
    
    for (let i = 0; i < updatedBuckets.length; i++) {
      const bucket = updatedBuckets[i];
      try {
        const { data, error } = await supabase.storage
          .from(bucket.name)
          .list("", { limit: 1000 });
        
        if (error) {
          updatedBuckets[i] = { ...bucket, fileCount: 0 };
        } else {
          const count = data?.length || 0;
          updatedBuckets[i] = { ...bucket, fileCount: count };
          totalFiles += count;
        }
      } catch {
        updatedBuckets[i] = { ...bucket, fileCount: 0 };
      }
    }
    
    setBuckets(updatedBuckets);
    setExportStats(prev => ({ ...prev, totalFiles }));
    addLog(`Encontrados ${totalFiles} arquivos em ${updatedBuckets.length} buckets`, "success");
  };

  // Carregar todas as contagens
  useEffect(() => {
    loadTableCounts();
    loadBucketCounts();
  }, []);

  // Converter dados para CSV
  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(","));
    }
    
    return csvRows.join("\n");
  };

  // Buscar dados de uma tabela com paginação
  const fetchTableData = async (tableName: string): Promise<any[]> => {
    const allData: any[] = [];
    const pageSize = 1000;
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .range(offset, offset + pageSize - 1);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        allData.push(...data);
        offset += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    
    return allData;
  };

  // Listar arquivos de um bucket recursivamente
  const listBucketFiles = async (bucketName: string, path: string = ""): Promise<{ path: string; name: string }[]> => {
    const files: { path: string; name: string }[] = [];
    
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path, { limit: 1000 });
      
      if (error) throw error;
      
      for (const item of data || []) {
        const fullPath = path ? `${path}/${item.name}` : item.name;
        
        if (item.id) {
          // É um arquivo
          files.push({ path: fullPath, name: item.name });
        } else {
          // É uma pasta, buscar recursivamente
          const subFiles = await listBucketFiles(bucketName, fullPath);
          files.push(...subFiles);
        }
      }
    } catch (err) {
      console.error(`Erro ao listar ${bucketName}/${path}:`, err);
    }
    
    return files;
  };

  // Exportar tudo
  const handleExportAll = async (includeDatabase = true, includeStorage = true) => {
    if (isExporting) return;
    
    setIsExporting(true);
    setProgress(0);
    setLogs([]);
    setExportStats(prev => ({ ...prev, exportedTables: 0, exportedBuckets: 0, errors: 0 }));
    
    const zip = new JSZip();
    const databaseFolder = zip.folder("database");
    const storageFolder = zip.folder("storage");
    const metadataFolder = zip.folder("metadata");
    
    const selectedTables = tables.filter(t => t.selected);
    const selectedBuckets = buckets.filter(b => b.selected);
    const totalOperations = 
      (includeDatabase ? selectedTables.length : 0) + 
      (includeStorage ? selectedBuckets.length : 0);
    
    let completedOperations = 0;
    let exportedTables = 0;
    let exportedBuckets = 0;
    let errors = 0;
    const tableSchemas: Record<string, string[]> = {};
    const tableCounts: Record<string, number> = {};
    const storageManifest: Record<string, string[]> = {};

    addLog(`Iniciando exportação completa...`, "info");
    addLog(`Database: ${includeDatabase ? selectedTables.length + " tabelas" : "não selecionado"}`, "info");
    addLog(`Storage: ${includeStorage ? selectedBuckets.length + " buckets" : "não selecionado"}`, "info");

    // Exportar Database
    if (includeDatabase && databaseFolder) {
      for (const table of selectedTables) {
        setCurrentOperation(`Exportando tabela: ${table.name}`);
        
        // Atualizar status da tabela
        setTables(prev => prev.map(t => 
          t.name === table.name ? { ...t, status: "loading" } : t
        ));
        
        try {
          addLog(`Buscando dados de ${table.name}...`, "info");
          const data = await fetchTableData(table.name);
          
          if (data.length > 0) {
            const csv = convertToCSV(data);
            databaseFolder.file(`${table.name}.csv`, csv);
            tableSchemas[table.name] = Object.keys(data[0]);
            tableCounts[table.name] = data.length;
            addLog(`✓ ${table.name}: ${data.length.toLocaleString()} registros exportados`, "success");
          } else {
            databaseFolder.file(`${table.name}.csv`, "");
            tableCounts[table.name] = 0;
            addLog(`✓ ${table.name}: tabela vazia`, "warning");
          }
          
          setTables(prev => prev.map(t => 
            t.name === table.name ? { ...t, status: "success" } : t
          ));
          exportedTables++;
        } catch (err: any) {
          addLog(`✗ ${table.name}: ${err.message || "Erro ao exportar"}`, "error");
          setTables(prev => prev.map(t => 
            t.name === table.name ? { ...t, status: "error" } : t
          ));
          errors++;
        }
        
        completedOperations++;
        setProgress((completedOperations / totalOperations) * 100);
      }
      
      // Adicionar schema info
      databaseFolder.file("_schema_info.json", JSON.stringify(tableSchemas, null, 2));
    }

    // Exportar Storage
    if (includeStorage && storageFolder) {
      for (const bucket of selectedBuckets) {
        setCurrentOperation(`Exportando bucket: ${bucket.name}`);
        
        setBuckets(prev => prev.map(b => 
          b.name === bucket.name ? { ...b, status: "loading" } : b
        ));
        
        try {
          addLog(`Listando arquivos de ${bucket.name}...`, "info");
          const files = await listBucketFiles(bucket.name);
          const bucketFolder = storageFolder.folder(bucket.name);
          
          storageManifest[bucket.name] = [];
          
          for (const file of files) {
            try {
              const { data, error } = await supabase.storage
                .from(bucket.name)
                .download(file.path);
              
              if (error) throw error;
              
              if (data && bucketFolder) {
                bucketFolder.file(file.path, data);
                storageManifest[bucket.name].push(file.path);
              }
            } catch (fileErr: any) {
              // Tentar obter URL pública para arquivos grandes
              const { data: urlData } = supabase.storage
                .from(bucket.name)
                .getPublicUrl(file.path);
              
              storageManifest[bucket.name].push(`[URL] ${urlData.publicUrl}`);
            }
          }
          
          addLog(`✓ ${bucket.name}: ${files.length} arquivos exportados`, "success");
          setBuckets(prev => prev.map(b => 
            b.name === bucket.name ? { ...b, status: "success" } : b
          ));
          exportedBuckets++;
        } catch (err: any) {
          addLog(`✗ ${bucket.name}: ${err.message || "Erro ao exportar"}`, "error");
          setBuckets(prev => prev.map(b => 
            b.name === bucket.name ? { ...b, status: "error" } : b
          ));
          errors++;
        }
        
        completedOperations++;
        setProgress((completedOperations / totalOperations) * 100);
      }
    }

    // Adicionar metadados
    if (metadataFolder) {
      const exportInfo = {
        exportDate: new Date().toISOString(),
        exportedBy: user?.email,
        projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        includeDatabase,
        includeStorage,
        tablesExported: exportedTables,
        bucketsExported: exportedBuckets,
        errors,
        version: "1.0.0"
      };
      
      metadataFolder.file("export_info.json", JSON.stringify(exportInfo, null, 2));
      metadataFolder.file("table_counts.json", JSON.stringify(tableCounts, null, 2));
      metadataFolder.file("storage_manifest.json", JSON.stringify(storageManifest, null, 2));
    }

    // Adicionar README
    const readme = `
EasyPet - Exportação Completa de Dados
======================================

Data de Exportação: ${new Date().toLocaleString("pt-BR")}
Exportado por: ${user?.email}

Estrutura do ZIP:
-----------------
├── database/         - CSVs de todas as tabelas do banco
│   ├── *.csv        - Dados de cada tabela
│   └── _schema_info.json - Schema das tabelas
├── storage/          - Arquivos dos buckets de storage
│   ├── avatars/     - Fotos de perfil
│   ├── backups/     - Backups do sistema
│   ├── blog-images/ - Imagens do blog
│   └── site-images/ - Imagens do site
├── metadata/         - Informações da exportação
│   ├── export_info.json    - Dados da exportação
│   ├── table_counts.json   - Contagem por tabela
│   └── storage_manifest.json - Lista de arquivos
└── README.txt        - Este arquivo

Estatísticas:
-------------
- Tabelas exportadas: ${exportedTables}
- Buckets exportados: ${exportedBuckets}
- Erros: ${errors}

Para importar os dados:
-----------------------
1. Use os CSVs para importar no banco de destino
2. Faça upload dos arquivos de storage manualmente
3. Verifique os metadados para configurações

Suporte: contato@easypet.com.br
`;
    
    zip.file("README.txt", readme);

    // Gerar e baixar ZIP
    setCurrentOperation("Gerando arquivo ZIP...");
    addLog("Comprimindo arquivos...", "info");
    
    try {
      const content = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      }, (metadata) => {
        setProgress(metadata.percent);
      });
      
      // Criar link de download
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      const filename = `easypet_full_export_${new Date().toISOString().split("T")[0]}.zip`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const sizeInMB = (content.size / 1024 / 1024).toFixed(2);
      addLog(`✓ Exportação concluída! Arquivo: ${filename} (${sizeInMB} MB)`, "success");
      
      toast({
        title: "Exportação Concluída!",
        description: `${filename} (${sizeInMB} MB) baixado com sucesso.`
      });
    } catch (err: any) {
      addLog(`✗ Erro ao gerar ZIP: ${err.message}`, "error");
      toast({
        title: "Erro na Exportação",
        description: err.message,
        variant: "destructive"
      });
    }
    
    setExportStats({ 
      totalRecords: exportStats.totalRecords, 
      totalFiles: exportStats.totalFiles,
      exportedTables, 
      exportedBuckets, 
      errors 
    });
    setIsExporting(false);
    setCurrentOperation("");
  };

  // Toggle seleção de tabela
  const toggleTable = (name: string) => {
    setTables(prev => prev.map(t => 
      t.name === name ? { ...t, selected: !t.selected } : t
    ));
  };

  // Toggle seleção de bucket
  const toggleBucket = (name: string) => {
    setBuckets(prev => prev.map(b => 
      b.name === name ? { ...b, selected: !b.selected } : b
    ));
  };

  // Selecionar todas as tabelas
  const selectAllTables = (selected: boolean) => {
    setTables(prev => prev.map(t => ({ ...t, selected })));
  };

  // Selecionar todos os buckets
  const selectAllBuckets = (selected: boolean) => {
    setBuckets(prev => prev.map(b => ({ ...b, selected })));
  };

  const selectedTablesCount = tables.filter(t => t.selected).length;
  const selectedBucketsCount = buckets.filter(b => b.selected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileArchive className="h-8 w-8 text-primary" />
            Ferramenta de Exportação de Dados
          </h1>
          <p className="text-muted-foreground mt-1">
            Exporte todos os dados do sistema para backup ou migração
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {isGodUser ? "🔱 GOD MODE" : "ADMIN"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tabelas</p>
              <p className="text-2xl font-bold">{tables.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registros</p>
              <p className="text-2xl font-bold">
                {isLoadingCounts ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  exportStats.totalRecords.toLocaleString()
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <HardDrive className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Buckets</p>
              <p className="text-2xl font-bold">{buckets.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <FolderOpen className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arquivos</p>
              <p className="text-2xl font-bold">{exportStats.totalFiles.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Database</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => loadTableCounts()}
                  disabled={isLoadingCounts}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingCounts ? "animate-spin" : ""}`} />
                </Button>
                <Checkbox 
                  checked={selectedTablesCount === tables.length}
                  onCheckedChange={(checked) => selectAllTables(!!checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedTablesCount}/{tables.length}
                </span>
              </div>
            </div>
            <CardDescription>
              Selecione as tabelas para exportar em formato CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {tables.map(table => (
                  <div 
                    key={table.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={table.selected}
                        onCheckedChange={() => toggleTable(table.name)}
                        disabled={isExporting}
                      />
                      <span className="font-mono text-sm">{table.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {table.count !== null && (
                        <Badge variant="secondary" className="font-mono">
                          {table.count.toLocaleString()}
                        </Badge>
                      )}
                      {table.status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                      {table.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {table.status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Storage Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-green-500" />
                <CardTitle>Storage</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => loadBucketCounts()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Checkbox 
                  checked={selectedBucketsCount === buckets.length}
                  onCheckedChange={(checked) => selectAllBuckets(!!checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedBucketsCount}/{buckets.length}
                </span>
              </div>
            </div>
            <CardDescription>
              Selecione os buckets de storage para incluir na exportação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {buckets.map(bucket => (
                <div 
                  key={bucket.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={bucket.selected}
                      onCheckedChange={() => toggleBucket(bucket.name)}
                      disabled={isExporting}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bucket.name}</span>
                        <Badge variant={bucket.public ? "default" : "secondary"}>
                          {bucket.public ? "público" : "privado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{bucket.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bucket.fileCount !== null && (
                      <Badge variant="outline">
                        {bucket.fileCount} arquivos
                      </Badge>
                    )}
                    {bucket.status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {bucket.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {bucket.status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Logs */}
      {(isExporting || logs.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {isExporting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Exportação Concluída
                </>
              )}
            </CardTitle>
            {currentOperation && (
              <CardDescription>{currentOperation}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <Separator />
            
            <ScrollArea className="h-[200px]">
              <div className="space-y-1 font-mono text-sm">
                {logs.map((log, i) => (
                  <div 
                    key={i}
                    className={`flex gap-2 ${
                      log.type === "error" ? "text-destructive" :
                      log.type === "success" ? "text-green-500" :
                      log.type === "warning" ? "text-yellow-500" :
                      "text-muted-foreground"
                    }`}
                  >
                    <span className="opacity-50">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {!isExporting && exportStats.exportedTables > 0 && (
              <div className="flex gap-4 text-sm">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {exportStats.exportedTables} tabelas
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {exportStats.exportedBuckets} buckets
                </Badge>
                {exportStats.errors > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    {exportStats.errors} erros
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button 
          size="lg" 
          onClick={() => handleExportAll(true, true)}
          disabled={isExporting || (selectedTablesCount === 0 && selectedBucketsCount === 0)}
          className="flex-1 min-w-[200px]"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Exportar Tudo
            </>
          )}
        </Button>
        
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => handleExportAll(true, false)}
          disabled={isExporting || selectedTablesCount === 0}
        >
          <Database className="mr-2 h-5 w-5" />
          Apenas Database
        </Button>
        
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => handleExportAll(false, true)}
          disabled={isExporting || selectedBucketsCount === 0}
        >
          <HardDrive className="mr-2 h-5 w-5" />
          Apenas Storage
        </Button>
      </div>
    </div>
  );
}
