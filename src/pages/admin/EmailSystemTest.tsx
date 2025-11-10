import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Shield, Clock, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmailSystemTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [testResults, setTestResults] = useState<any>(null);

  // Test 1: Password Reset - Send Code
  const testPasswordResetSend = async () => {
    if (!testEmail) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email para testar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTestResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-reset-code', {
        body: { email: testEmail }
      });

      if (error) throw error;

      setTestResults({
        test: 'password_reset_send',
        success: true,
        message: 'Código enviado com sucesso',
        data: data,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "✅ Teste Bem-Sucedido",
        description: "Código de reset enviado. Verifique o email ou banco de dados.",
      });
    } catch (error: any) {
      setTestResults({
        test: 'password_reset_send',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "❌ Falha no Teste",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Admin Alert Email
  const testAdminAlert = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          severity: 'info',
          module: 'email_system_test',
          subject: '🧪 Teste de Sistema de Email - EasyPet',
          message: 'Este é um email de teste após atualização da RESEND_API_KEY.',
          details: {
            timestamp: new Date().toISOString(),
            test_id: Math.random().toString(36).substring(7),
            test_type: 'admin_notification',
          }
        }
      });

      if (error) throw error;

      setTestResults({
        test: 'admin_alert',
        success: true,
        message: 'Email de alerta enviado para admins',
        data: data,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "✅ Teste Bem-Sucedido",
        description: "Email de alerta enviado para todos os administradores.",
      });
    } catch (error: any) {
      setTestResults({
        test: 'admin_alert',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "❌ Falha no Teste",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Rate Limiting
  const testRateLimit = async () => {
    if (!testEmail) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email para testar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTestResults(null);

    try {
      const results = [];
      
      // Tentar enviar 4 códigos seguidos
      for (let i = 1; i <= 4; i++) {
        const { data, error } = await supabase.functions.invoke('send-reset-code', {
          body: { email: testEmail }
        });

        results.push({
          attempt: i,
          success: !error,
          data: error ? null : data,
          error: error?.message,
        });

        // Pequeno delay entre tentativas
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const blockedAttempt = results.find(r => !r.success);
      
      setTestResults({
        test: 'rate_limiting',
        success: !!blockedAttempt,
        message: blockedAttempt 
          ? `Rate limit ativado na tentativa ${blockedAttempt.attempt}` 
          : 'Rate limit NÃO foi acionado (problema!)',
        results: results,
        timestamp: new Date().toISOString(),
      });

      if (blockedAttempt) {
        toast({
          title: "✅ Rate Limit Funcionando",
          description: `Bloqueado na tentativa ${blockedAttempt.attempt}`,
        });
      } else {
        toast({
          title: "⚠️ Rate Limit Não Acionado",
          description: "Problema: 4 tentativas passaram sem bloqueio",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setTestResults({
        test: 'rate_limiting',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "❌ Erro no Teste",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check system logs
  const checkSystemLogs = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .in('module', ['send_reset_code', 'send_notification', 'send_alert_email', 'send_security_alert_email'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setTestResults({
        test: 'system_logs',
        success: true,
        logs: data,
        count: data.length,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Logs Carregados",
        description: `${data.length} entradas encontradas`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao Carregar Logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check password resets
  const checkPasswordResets = async () => {
    if (!testEmail) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email para consultar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('password_resets')
        .select('*')
        .eq('email', testEmail)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setTestResults({
        test: 'password_resets',
        success: true,
        resets: data,
        count: data.length,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Consulta Realizada",
        description: `${data.length} tentativas encontradas para ${testEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro na Consulta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Email - Testes</h1>
          <p className="text-muted-foreground">
            Verifique o funcionamento do sistema de emails após atualização da API key
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Mail className="h-4 w-4 mr-2" />
          Ambiente de Teste
        </Badge>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Estes testes enviam emails reais. Use com moderação para não esgotar o limite da API.
          O Resend permite 100 emails/mês em modo teste.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Testes Funcionais</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test 1: Password Reset */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Teste 1: Reset de Senha
                </CardTitle>
                <CardDescription>
                  Envia código de recuperação de senha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-email">Email de Teste</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={testPasswordResetSend}
                  disabled={loading || !testEmail}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Código
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Test 2: Admin Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Teste 2: Alerta de Admin
                </CardTitle>
                <CardDescription>
                  Envia email de teste para todos os administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testAdminAlert}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Email de Teste
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Test 3: Rate Limiting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Teste 3: Rate Limiting
                </CardTitle>
                <CardDescription>
                  Testa bloqueio após múltiplas tentativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Este teste faz 4 tentativas seguidas. A 4ª deve ser bloqueada.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={testRateLimit}
                  disabled={loading || !testEmail}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Testar Rate Limit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>
                  Últimas 10 entradas de logs de email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={checkSystemLogs}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Verificar Logs"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Password Resets */}
            <Card>
              <CardHeader>
                <CardTitle>Tentativas de Reset</CardTitle>
                <CardDescription>
                  Consultar códigos enviados para um email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="query-email">Email para Consultar</Label>
                  <Input
                    id="query-email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={checkPasswordResets}
                  disabled={loading || !testEmail}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    "Consultar Tentativas"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {testResults.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Resultados do Teste: {testResults.test}
                </CardTitle>
                <CardDescription>
                  {new Date(testResults.timestamp).toLocaleString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum teste executado ainda. Execute um teste na aba "Testes Funcionais".
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Referência Rápida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">✅ Resultados Esperados:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Toast verde "Código enviado com sucesso"</li>
                <li>• Email recebido na caixa de entrada</li>
                <li>• Código de 6 dígitos salvo no banco</li>
                <li>• Rate limit ativa após 3 tentativas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">❌ Possíveis Problemas:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• "API key is invalid" = Chave incorreta</li>
                <li>• "Domain not verified" = Domínio não configurado</li>
                <li>• Email no spam = Usar domínio verificado</li>
                <li>• Rate limit não ativa = Verificar configuração</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
