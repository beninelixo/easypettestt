import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Database, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { format as formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FeatureGate } from "@/components/FeatureGate";

interface BackupOptions {
  includeClients: boolean;
  includeAppointments: boolean;
  includeServices: boolean;
  includeProducts: boolean;
  includeFinancial: boolean;
}

interface BackupHistory {
  id: string;
  created_at: string;
  format: string;
  file_size_bytes: number;
  status: string;
  metadata: any;
}

const ProfessionalBackup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [petShopId, setPetShopId] = useState<string | null>(null);
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [progress, setProgress] = useState(0);

  const [options, setOptions] = useState<BackupOptions>({
    includeClients: true,
    includeAppointments: true,
    includeServices: true,
    includeProducts: true,
    includeFinancial: true,
  });

  const [format, setFormat] = useState<"json" | "csv" | "pdf" | "all">("json");

  useEffect(() => {
    loadPetShop();
    loadBackupHistory();
  }, [user]);

  const loadPetShop = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (data) {
      setPetShopId(data.id);
    }
  };

  const loadBackupHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("professional_backups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setHistory(data);
    }
  };

  const generateBackup = async () => {
    if (!petShopId) {
      toast({
        title: "Erro",
        description: "Pet shop não encontrado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const { data, error } = await supabase.functions.invoke("generate-professional-backup", {
        body: {
          petShopId,
          options,
          format,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      // Create download link
      const formatExtension = format === "pdf" ? "pdf" : format === "csv" ? "zip" : "json";
      const formatUpper = format.toString().toUpperCase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${format}-${formatDate(new Date(), "yyyy-MM-dd-HHmmss")}.${formatExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Backup gerado com sucesso!",
        description: `Arquivo ${formatUpper} baixado`,
      });

      loadBackupHistory();
    } catch (error: any) {
      toast({
        title: "Erro ao gerar backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <FeatureGate featureKey="backup_automatico" requiredPlan="platinum">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Backup de Dados</h1>
            <p className="text-muted-foreground">Exporte todos os dados do seu pet shop de forma segura</p>
          </div>
        </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          O backup inclui todos os dados selecionados abaixo. Mantenha seus backups em local seguro e faça-os
          regularmente.
        </AlertDescription>
      </Alert>

      {/* Main Backup Card */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Novo Backup</CardTitle>
          <CardDescription>Selecione o que deseja incluir no backup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Options Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Dados a Incluir:</Label>
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clients"
                  checked={options.includeClients}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeClients: checked as boolean })
                  }
                />
                <Label htmlFor="clients" className="cursor-pointer">
                  Clientes e Pets (perfis, informações de saúde, vacinação)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="appointments"
                  checked={options.includeAppointments}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeAppointments: checked as boolean })
                  }
                />
                <Label htmlFor="appointments" className="cursor-pointer">
                  Agendamentos (histórico completo, status, observações)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="services"
                  checked={options.includeServices}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeServices: checked as boolean })
                  }
                />
                <Label htmlFor="services" className="cursor-pointer">
                  Serviços (lista de serviços, preços, durações)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="products"
                  checked={options.includeProducts}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeProducts: checked as boolean })
                  }
                />
                <Label htmlFor="products" className="cursor-pointer">
                  Produtos e Estoque (inventário, movimentações)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="financial"
                  checked={options.includeFinancial}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeFinancial: checked as boolean })
                  }
                />
                <Label htmlFor="financial" className="cursor-pointer">
                  Dados Financeiros (pagamentos, receita, comissões)
                </Label>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Formato de Exportação:</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="cursor-pointer">
                  JSON (completo, estruturado, ideal para backup)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="cursor-pointer">
                  CSV (planilhas, fácil de importar no Excel)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="cursor-pointer">
                  PDF (relatório visual, fácil de ler)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">
                  Todos os formatos (JSON + CSV + PDF)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gerando backup...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Action Button */}
          <Button onClick={generateBackup} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Gerando Backup...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Gerar e Baixar Backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backups Anteriores</CardTitle>
          <CardDescription>Histórico dos últimos 10 backups gerados</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>Nenhum backup gerado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {backup.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        Backup {String(backup.format).toUpperCase()} -{" "}
                        {formatDate(new Date(backup.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(backup.file_size_bytes || 0)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={backup.status === "completed" ? "default" : "secondary"}>
                    {backup.status === "completed" ? "Concluído" : "Processando"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

        {/* Info Card */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">💡 Dicas de Segurança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Faça backups regulares (recomendado: semanalmente)</p>
            <p>• Armazene os backups em local seguro (nuvem + cópia local)</p>
            <p>• Teste a restauração dos backups periodicamente</p>
            <p>• Mantenha pelo menos 3 versões de backup</p>
            <p>• Não compartilhe seus arquivos de backup com terceiros</p>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
};

export default ProfessionalBackup;
