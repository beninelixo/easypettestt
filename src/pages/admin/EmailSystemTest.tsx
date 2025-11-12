import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Send, TestTube } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmailSystemTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [testRole, setTestRole] = useState<"client" | "pet_shop" | "admin">("client");
  const [lastResult, setLastResult] = useState<any>(null);

  const handleTestWelcomeEmail = async () => {
    if (!testEmail || !testName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e nome para o teste",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          userId: '00000000-0000-0000-0000-000000000000', // Test user ID
          email: testEmail,
          fullName: testName,
          role: testRole,
        },
      });

      if (error) throw error;

      setLastResult(data);
      
      toast({
        title: "✅ Email enviado com sucesso!",
        description: `Email de boas-vindas enviado para ${testEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: "❌ Erro ao enviar email",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      setLastResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestTransactional = async () => {
    if (!testEmail) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email para o teste",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-loops-email', {
        body: {
          action: 'send_transactional',
          transactionalId: 'welcome-email',
          email: testEmail,
          dataVariables: {
            firstName: testName.split(' ')[0] || 'Usuário',
            userName: testName || 'Usuário Teste',
            subject: '🎉 Email de Teste - EasyPet',
            message: 'Este é um email de teste do sistema EasyPet!',
            cta: 'Teste realizado com sucesso!',
            tips: [
              '✅ Sistema de emails funcionando',
              '📧 Template configurado corretamente',
              '🚀 Pronto para produção'
            ],
            role: testRole,
          },
        },
      });

      if (error) throw error;

      setLastResult(data);
      
      toast({
        title: "✅ Email transacional enviado!",
        description: `Teste enviado para ${testEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending transactional email:', error);
      toast({
        title: "❌ Erro ao enviar email",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      setLastResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    if (!testEmail || !testName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e nome",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-loops-email', {
        body: {
          action: 'create_contact',
          email: testEmail,
          firstName: testName.split(' ')[0],
          lastName: testName.split(' ').slice(1).join(' ') || '',
          userGroup: testRole,
          subscribed: true,
        },
      });

      if (error) throw error;

      setLastResult(data);
      
      toast({
        title: "✅ Contato criado no Loops!",
        description: `${testEmail} adicionado com role ${testRole}`,
      });
    } catch (error: any) {
      console.error('Error creating contact:', error);
      toast({
        title: "❌ Erro ao criar contato",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      setLastResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerEvent = async () => {
    if (!testEmail) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email para o teste",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-loops-email', {
        body: {
          action: 'send_event',
          email: testEmail,
          eventName: 'user_registered',
          eventProperties: {
            role: testRole,
            registrationDate: new Date().toISOString(),
            testMode: true,
          },
        },
      });

      if (error) throw error;

      setLastResult(data);
      
      toast({
        title: "✅ Evento disparado!",
        description: `Evento user_registered enviado para ${testEmail}`,
      });
    } catch (error: any) {
      console.error('Error triggering event:', error);
      toast({
        title: "❌ Erro ao disparar evento",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      setLastResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🧪 Sistema de Testes de Email</h1>
        <p className="text-muted-foreground">
          Teste o sistema de emails e automação Loops sem criar contas reais
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuração do Teste
            </CardTitle>
            <CardDescription>
              Configure os dados para envio de email de teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de Teste</Label>
              <Input
                id="email"
                type="email"
                placeholder="teste@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="João Silva"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role (Tipo de Usuário)</Label>
              <Select value={testRole} onValueChange={(value: any) => setTestRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="pet_shop">Pet Shop</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Ações de Teste
            </CardTitle>
            <CardDescription>
              Execute diferentes testes do sistema de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleTestWelcomeEmail}
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar Email de Boas-Vindas
            </Button>

            <Button
              onClick={handleTestTransactional}
              disabled={loading}
              className="w-full"
              variant="secondary"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Testar Email Transacional
            </Button>

            <Button
              onClick={handleCreateContact}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Criar Contato no Loops
            </Button>

            <Button
              onClick={handleTriggerEvent}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="mr-2 h-4 w-4" />
              )}
              Disparar Evento user_registered
            </Button>
          </CardContent>
        </Card>
      </div>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Último Teste</CardTitle>
          </CardHeader>
          <CardContent>
            {lastResult.error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Erro:</strong> {lastResult.error}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(lastResult, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📋 Instruções de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Email de Boas-Vindas</h3>
            <p className="text-sm text-muted-foreground">
              Envia o email completo de boas-vindas com conteúdo personalizado por role. 
              Use esta opção para testar o fluxo completo de registro.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Email Transacional</h3>
            <p className="text-sm text-muted-foreground">
              Testa diretamente o template 'welcome-email' no Loops. 
              Útil para verificar se o template está configurado corretamente.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Criar Contato</h3>
            <p className="text-sm text-muted-foreground">
              Adiciona um contato no Loops com a role especificada. 
              Necessário antes de testar automações.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Disparar Evento</h3>
            <p className="text-sm text-muted-foreground">
              Dispara o evento 'user_registered' para iniciar as automações de onboarding 
              (Day 3 tips, Day 7 engagement). O contato deve existir primeiro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
