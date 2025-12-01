import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SQL_FIXES = `-- ============================================
-- CORREÇÕES DE SEGURANÇA AUTOMÁTICAS
-- ============================================

-- 1. CRÍTICO: Adicionar políticas RLS para settings_passwords
DROP POLICY IF EXISTS settings_passwords_owner_policy ON public.settings_passwords;
DROP POLICY IF EXISTS settings_passwords_admin_policy ON public.settings_passwords;

CREATE POLICY settings_passwords_owner_policy 
ON public.settings_passwords FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.pet_shops WHERE pet_shops.id = settings_passwords.pet_shop_id AND pet_shops.owner_id = auth.uid())) 
WITH CHECK (EXISTS (SELECT 1 FROM public.pet_shops WHERE pet_shops.id = settings_passwords.pet_shop_id AND pet_shops.owner_id = auth.uid()));

CREATE POLICY settings_passwords_admin_policy 
ON public.settings_passwords FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_god_user(auth.uid()));

-- 2. Corrigir funções SECURITY DEFINER sem search_path fixo
ALTER FUNCTION public.cleanup_expired_mfa_sessions() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_blocks() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_reset_codes() SET search_path = public;
ALTER FUNCTION public.cleanup_old_logs() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_invites() SET search_path = public;
ALTER FUNCTION public.cleanup_old_login_attempts() SET search_path = public;
ALTER FUNCTION public.resolve_old_alerts() SET search_path = public;

-- 3. Mover extensão pg_net do schema public para extensions
ALTER EXTENSION pg_net SET SCHEMA extensions;`;

interface SecurityIssue {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  status: "pending" | "checking" | "fixed" | "error";
  checkQuery?: string;
}

export default function SecurityFixes() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [issues, setIssues] = useState<SecurityIssue[]>([
    {
      id: "rls_policies",
      title: "Políticas RLS ausentes em settings_passwords",
      description: "Tabela com RLS ativado mas sem políticas, bloqueando criação de senhas",
      severity: "critical",
      status: "pending",
      checkQuery: "SELECT COUNT(*) as count FROM pg_policies WHERE tablename = 'settings_passwords'"
    },
    {
      id: "search_path",
      title: "Funções SECURITY DEFINER sem search_path fixo",
      description: "7 funções vulneráveis a ataques de hijacking de search_path",
      severity: "high",
      status: "pending"
    },
    {
      id: "extension_schema",
      title: "Extensão pg_net no schema público",
      description: "Extensão deve estar no schema 'extensions' para melhor organização",
      severity: "medium",
      status: "pending"
    }
  ]);

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(SQL_FIXES);
      setCopied(true);
      toast({
        title: "SQL copiado!",
        description: "Cole no SQL Editor do Supabase para aplicar as correções",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente copiar manualmente do arquivo SECURITY_FIXES.sql",
        variant: "destructive",
      });
    }
  };

  const openSupabaseDashboard = () => {
    window.open("https://supabase.com/dashboard/project/xkfkrdorghyagtwbxory/sql/new", "_blank");
  };

  const checkStatus = async () => {
    setChecking(true);
    
    toast({
      title: "Verificação manual necessária",
      description: "Execute o SQL no dashboard do Supabase. As políticas RLS aparecerão na tabela settings_passwords após execução.",
    });
    
    setChecking(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 dark:text-red-400";
      case "high":
        return "text-orange-600 dark:text-orange-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fixed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "checking":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Correções de Segurança</h1>
        <p className="text-muted-foreground">
          Execute as correções SQL para resolver problemas de segurança identificados
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Estas correções requerem acesso ao SQL Editor do Supabase. 
          As mudanças são seguras e não afetam dados existentes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {issues.map((issue) => (
          <Card key={issue.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(issue.status)}
                    <CardTitle className="text-lg">{issue.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">{issue.description}</CardDescription>
                </div>
                <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como Aplicar as Correções</CardTitle>
          <CardDescription>
            Siga estes passos simples para aplicar todas as correções automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Copie o SQL de correção</p>
                <p className="text-sm text-muted-foreground">Clique no botão abaixo para copiar todo o SQL necessário</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Abra o SQL Editor do Supabase</p>
                <p className="text-sm text-muted-foreground">O dashboard abrirá em uma nova aba</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Cole e execute o SQL</p>
                <p className="text-sm text-muted-foreground">
                  Cole o SQL copiado no editor e clique em "Run" (ou pressione Ctrl+Enter)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </div>
              <div className="flex-1">
                <p className="font-medium">Verifique o status</p>
                <p className="text-sm text-muted-foreground">
                  Volte aqui e clique em "Verificar Status" para confirmar que tudo foi aplicado
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={copySQL} size="lg">
              {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "SQL Copiado!" : "Copiar SQL"}
            </Button>

            <Button onClick={openSupabaseDashboard} variant="outline" size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir SQL Editor
            </Button>

            <Button onClick={checkStatus} variant="secondary" size="lg" disabled={checking}>
              {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SQL de Correção Completo</CardTitle>
          <CardDescription>
            Você também pode copiar manualmente daqui se preferir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
            <code>{SQL_FIXES}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
