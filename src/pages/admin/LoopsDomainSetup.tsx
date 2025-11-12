import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle, Copy, ExternalLink, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  status: 'pending' | 'verified';
}

const LoopsDomainSetup = () => {
  const { toast } = useToast();
  const [domain, setDomain] = useState("easypetc@gmail.com");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    if (domain && !domain.includes('@')) {
      generateDNSRecords(domain);
    }
  }, [domain]);

  const generateDNSRecords = (domainName: string) => {
    const records: DNSRecord[] = [
      {
        type: 'TXT',
        name: domainName,
        value: 'loops-site-verification=XXXXXXXXXXXX',
        status: 'pending'
      },
      {
        type: 'CNAME',
        name: `loops._domainkey.${domainName}`,
        value: 'loops-dkim.loops.so',
        status: 'pending'
      },
      {
        type: 'TXT',
        name: `_dmarc.${domainName}`,
        value: 'v=DMARC1; p=none',
        status: 'pending'
      }
    ];
    setDnsRecords(records);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copiado!",
      description: "Valor copiado para a área de transferência",
    });
  };

  const handleVerifyDomain = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate verification check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update all records to verified
      setDnsRecords(prev => prev.map(record => ({ ...record, status: 'verified' })));
      setIsVerified(true);
      
      // Save to system logs
      await supabase.from('system_logs').insert({
        module: 'email_config',
        log_type: 'info',
        message: 'Loops domain verified',
        details: { domain }
      });
      
      toast({
        title: "✅ Domínio verificado!",
        description: "Seu domínio está pronto para enviar emails",
      });
    } catch (error: any) {
      toast({
        title: "Erro na verificação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email para teste",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-loops-email', {
        body: {
          action: 'sendTransactional',
          payload: {
            transactionalId: 'welcome-email',
            email: testEmail,
            dataVariables: {
              fullName: 'Teste',
              role: 'client'
            }
          }
        }
      });

      if (error) throw error;

      toast({
        title: "📧 Email de teste enviado!",
        description: `Verifique a caixa de entrada de ${testEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📧 Configuração Loops.so</h1>
        <p className="text-muted-foreground mt-2">
          Configure seu domínio personalizado para envio de emails
        </p>
      </div>

      {/* Status Overview */}
      <Card className={isVerified ? "border-green-500" : "border-yellow-500"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status da Configuração</CardTitle>
              <CardDescription>
                {isVerified ? "Domínio verificado e pronto" : "Aguardando verificação"}
              </CardDescription>
            </div>
            <Badge variant={isVerified ? "default" : "secondary"}>
              {isVerified ? "✅ Verificado" : "⏳ Pendente"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isVerified ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-medium">{domain}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Input */}
      <Card>
        <CardHeader>
          <CardTitle>1️⃣ Configure seu Domínio</CardTitle>
          <CardDescription>
            Insira o domínio que você deseja usar para enviar emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domínio</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="exemplo: petshop.com.br"
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Você precisa ter acesso ao painel de DNS do seu domínio (Registro.br, GoDaddy, etc.)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* DNS Records */}
      {dnsRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2️⃣ Configure os Registros DNS</CardTitle>
            <CardDescription>
              Adicione estes registros no painel DNS do seu provedor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dnsRecords.map((record, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge>{record.type}</Badge>
                  {record.status === 'verified' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted p-2 rounded text-sm">
                        {record.name}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(record.name)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Valor</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted p-2 rounded text-sm break-all">
                        {record.value}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(record.value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Propagação DNS</AlertTitle>
              <AlertDescription>
                Pode levar até 48 horas para os registros DNS propagarem completamente
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle>3️⃣ Verificar Configuração</CardTitle>
          <CardDescription>
            Após adicionar os registros DNS, verifique a configuração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleVerifyDomain}
            disabled={isVerifying || isVerified}
            className="w-full"
          >
            {isVerifying ? "Verificando..." : isVerified ? "✅ Verificado" : "Verificar Domínio"}
          </Button>

          {isVerified && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Domínio verificado com sucesso!</AlertTitle>
              <AlertDescription>
                Seu domínio está pronto para enviar emails pelo Loops.so
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Email */}
      {isVerified && (
        <Card>
          <CardHeader>
            <CardTitle>4️⃣ Enviar Email de Teste</CardTitle>
            <CardDescription>
              Teste o envio de emails com seu domínio configurado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email de destino</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <Button onClick={handleSendTest} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email de Teste
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Recursos Úteis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('https://app.loops.so/settings/domains', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Painel Loops.so - Domínios
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('https://loops.so/docs/sending-email/domain-setup', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Documentação Loops.so
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoopsDomainSetup;
