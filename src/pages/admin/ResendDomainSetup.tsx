import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResendDomain } from "@/hooks/useResendDomain";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Globe, 
  Mail, 
  Copy, 
  ExternalLink, 
  Loader2,
  ArrowRight,
  AlertTriangle,
  Shield,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResendDomainSetup() {
  const { toast } = useToast();
  const {
    loading,
    domainSetup,
    loadDomainConfig,
    saveDomainConfig,
    generateDNSRecords,
    testDomain,
    updateEdgeFunctions,
  } = useResendDomain();

  const [currentStep, setCurrentStep] = useState(1);
  const [domainInput, setDomainInput] = useState("");
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    loadDomainConfig();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência`,
    });
  };

  const handleDomainSubmit = () => {
    if (!domainInput || !domainInput.includes('.')) {
      toast({
        title: "Domínio Inválido",
        description: "Digite um domínio válido (ex: easypet.com)",
        variant: "destructive",
      });
      return;
    }

    const records = generateDNSRecords(domainInput);
    saveDomainConfig({
      domain: domainInput,
      records: records,
      status: 'pending',
      lastChecked: new Date().toISOString(),
    });

    setCurrentStep(2);
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast({
        title: "Email Obrigatório",
        description: "Digite um email para enviar o teste",
        variant: "destructive",
      });
      return;
    }

    const success = await testDomain(testEmail);
    if (success) {
      setCurrentStep(4);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Verificado</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      default:
        return <Badge variant="secondary">Não Iniciado</Badge>;
    }
  };

  const steps = [
    { number: 1, title: "Configurar Domínio", icon: Globe },
    { number: 2, title: "Adicionar Registros DNS", icon: Shield },
    { number: 3, title: "Testar Domínio", icon: Mail },
    { number: 4, title: "Ativar", icon: Zap },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Domínio Personalizado</h1>
          <p className="text-muted-foreground">
            Configure seu domínio customizado para envio de emails profissionais
          </p>
        </div>
        {domainSetup.domain && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Domínio Atual</p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <code className="text-sm font-mono">noreply@{domainSetup.domain}</code>
              {getStatusBadge(domainSetup.status)}
            </div>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${isCompleted ? 'bg-green-500 text-white' : 
                        isActive ? 'bg-primary text-primary-foreground' : 
                        'bg-muted text-muted-foreground'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Setup Status */}
      {domainSetup.domain && (
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Status Atual:</strong> Domínio <code className="mx-1">{domainSetup.domain}</code> está {
              domainSetup.status === 'verified' ? 'verificado e ativo' :
              domainSetup.status === 'pending' ? 'aguardando verificação DNS' :
              'não configurado'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Tabs value={`step${currentStep}`} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {steps.map(step => (
            <TabsTrigger 
              key={step.number}
              value={`step${step.number}`}
              disabled={currentStep < step.number}
              onClick={() => setCurrentStep(step.number)}
            >
              Passo {step.number}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Step 1: Configure Domain */}
        <TabsContent value="step1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Passo 1: Configure seu Domínio
              </CardTitle>
              <CardDescription>
                Digite o domínio que você deseja usar para enviar emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Você precisa ter acesso às configurações DNS do seu domínio.
                  Certifique-se de ter uma conta no Resend: <a 
                    href="https://resend.com/domains" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    resend.com/domains
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="domain">Seu Domínio</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="domain"
                      type="text"
                      placeholder="easypet.com"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value.toLowerCase().trim())}
                    />
                    <Button 
                      onClick={handleDomainSubmit}
                      disabled={!domainInput}
                    >
                      Continuar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Exemplo: easypet.com (sem www)
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-semibold">O que acontece a seguir?</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Você receberá os registros DNS para configurar</li>
                    <li>• Adicione esses registros no painel do seu provedor de domínio</li>
                    <li>• Aguarde 24-72h para propagação DNS</li>
                    <li>• Teste o domínio para verificar se está funcionando</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: DNS Records */}
        <TabsContent value="step2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Passo 2: Configure os Registros DNS
              </CardTitle>
              <CardDescription>
                Adicione estes registros no painel DNS do seu provedor de domínio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Você deve adicionar TODOS os registros abaixo no Resend.
                  Acesse <a 
                    href="https://resend.com/domains" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    resend.com/domains
                    <ExternalLink className="h-3 w-3" />
                  </a> e clique em "Add Domain" para adicionar o domínio <strong>{domainSetup.domain}</strong>.
                  O Resend irá fornecer os valores exatos para os registros DNS.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">Registros DNS Necessários:</h3>
                
                {domainSetup.records.map((record, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Tipo</Label>
                          <p className="font-mono text-sm font-bold">{record.type}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Nome</Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm flex-1 truncate">{record.name}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(record.name, 'Nome')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Valor</Label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm flex-1 truncate">{record.value}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(record.value, 'Valor')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold">Instruções Detalhadas:</h4>
                <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                  <li>Acesse <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a></li>
                  <li>Clique em "Add Domain"</li>
                  <li>Digite: <strong>{domainSetup.domain}</strong></li>
                  <li>O Resend mostrará os registros DNS específicos para configurar</li>
                  <li>Copie cada registro e adicione no painel DNS do seu provedor</li>
                  <li>Aguarde a propagação DNS (pode levar até 72 horas)</li>
                  <li>Retorne ao Resend para verificar o status</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Voltar
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Registros Configurados - Testar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Test Domain */}
        <TabsContent value="step3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Passo 3: Teste seu Domínio
              </CardTitle>
              <CardDescription>
                Envie um email de teste para verificar se o domínio está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Certifique-se de que o domínio foi verificado no Resend antes de testar.
                  A propagação DNS pode levar de 24 a 72 horas.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-email">Email para Teste</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button 
                      onClick={handleTest}
                      disabled={loading || !testEmail}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Teste
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-semibold">O que será testado:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ Envio de email a partir de: <code className="mx-1">noreply@{domainSetup.domain}</code></li>
                    <li>✓ Verificação de autenticação SPF/DKIM</li>
                    <li>✓ Entrega na caixa de entrada (não spam)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Activate */}
        <TabsContent value="step4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Passo 4: Ativar Domínio Personalizado
              </CardTitle>
              <CardDescription>
                Finalize a configuração e ative o domínio no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  <strong>Parabéns!</strong> Seu domínio <code className="mx-1">{domainSetup.domain}</code> foi verificado com sucesso.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-muted rounded-lg space-y-4">
                <h4 className="font-semibold">Próximos Passos:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Atualizar Edge Functions</p>
                      <p className="text-muted-foreground">
                        As edge functions de email devem ser atualizadas manualmente para usar o novo domínio.
                      </p>
                      <code className="text-xs bg-background px-2 py-1 rounded mt-1 inline-block">
                        from: 'EasyPet &lt;noreply@{domainSetup.domain}&gt;'
                      </code>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Arquivos que Precisam de Atualização</p>
                      <ul className="text-muted-foreground mt-1 space-y-1">
                        <li>• supabase/functions/send-reset-code/index.ts</li>
                        <li>• supabase/functions/send-notification/index.ts</li>
                        <li>• supabase/functions/send-alert-email/index.ts</li>
                        <li>• supabase/functions/send-security-alert-email/index.ts</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Benefícios do Domínio Personalizado</p>
                      <ul className="text-muted-foreground mt-1 space-y-1">
                        <li>✓ Emails mais profissionais</li>
                        <li>✓ Menor chance de cair em spam</li>
                        <li>✓ Maior confiabilidade para clientes</li>
                        <li>✓ Sem limite de 100 emails/mês do modo teste</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={updateEdgeFunctions}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Registrar Atualização
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Úteis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="https://resend.com/docs/dashboard/domains/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 font-semibold mb-2">
                <ExternalLink className="h-4 w-4" />
                Documentação Resend
              </div>
              <p className="text-sm text-muted-foreground">
                Guia completo sobre configuração de domínios
              </p>
            </a>

            <a 
              href="https://resend.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 font-semibold mb-2">
                <Globe className="h-4 w-4" />
                Painel Resend
              </div>
              <p className="text-sm text-muted-foreground">
                Gerencie seus domínios no Resend
              </p>
            </a>

            <a 
              href="https://dnschecker.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 font-semibold mb-2">
                <Shield className="h-4 w-4" />
                Verificador DNS
              </div>
              <p className="text-sm text-muted-foreground">
                Verifique propagação de registros DNS
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
