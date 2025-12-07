import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, ChevronLeft, Smartphone, Key, 
  Monitor, Clock, MapPin, CheckCircle2,
  AlertTriangle, Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMFA } from "@/hooks/useMFA";
import { MFASetupWizard } from "@/components/mfa/MFASetupWizard";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

const ProfessionalSecurity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkMFAStatus, loading: mfaLoading } = useMFA();
  
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMFAWizard, setShowMFAWizard] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Desktop",
      browser: "Chrome",
      location: "São Paulo, BR",
      lastActive: new Date(),
      current: true,
    },
    {
      id: "2",
      device: "Mobile",
      browser: "Safari",
      location: "Rio de Janeiro, BR",
      lastActive: new Date(Date.now() - 86400000),
      current: false,
    },
  ]);

  useEffect(() => {
    const loadSecurityData = async () => {
      const mfaStatus = await checkMFAStatus();
      setMfaEnabled(mfaStatus);
      setLoading(false);
    };
    
    loadSecurityData();
  }, []);

  const handleMFAComplete = () => {
    setMfaEnabled(true);
    setShowMFAWizard(false);
    toast({
      title: "MFA ativado",
      description: "Autenticação de dois fatores configurada com sucesso",
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({
      title: "Sessão encerrada",
      description: "O dispositivo foi desconectado",
    });
  };

  const handleRevokeAllSessions = () => {
    setSessions(prev => prev.filter(s => s.current));
    toast({
      title: "Todas as sessões encerradas",
      description: "Apenas este dispositivo permanece conectado",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-indigo-500/5 border border-border/50 p-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/professional/settings")}
                className="rounded-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Segurança & MFA
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Proteja sua conta com autenticação avançada
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MFA Section */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-indigo-500" />
                  Autenticação de Dois Fatores (2FA)
                </CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança à sua conta
                </CardDescription>
              </div>
              <Badge 
                variant={mfaEnabled ? "default" : "secondary"}
                className={mfaEnabled ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
              >
                {mfaEnabled ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ativo
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Inativo
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mfaEnabled ? (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">
                      2FA está ativo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sua conta está protegida com autenticação de dois fatores
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      2FA não está configurado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Recomendamos ativar para maior segurança
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={() => setShowMFAWizard(true)}
              variant={mfaEnabled ? "outline" : "default"}
              className={!mfaEnabled ? "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700" : ""}
            >
              <Key className="h-4 w-4 mr-2" />
              {mfaEnabled ? "Reconfigurar 2FA" : "Ativar 2FA"}
            </Button>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-500" />
                  Sessões Ativas
                </CardTitle>
                <CardDescription>
                  Dispositivos conectados à sua conta
                </CardDescription>
              </div>
              {sessions.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRevokeAllSessions}
                  className="text-red-500 hover:text-red-600"
                >
                  Encerrar Todas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Monitor className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device} - {session.browser}</p>
                      {session.current && (
                        <Badge variant="outline" className="text-xs">
                          Este dispositivo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(session.lastActive, "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    Encerrar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Dicas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Use uma senha forte com no mínimo 10 caracteres, incluindo maiúsculas, minúsculas, números e símbolos
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Ative a autenticação de dois fatores (2FA) para proteção adicional
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Revise regularmente as sessões ativas e encerre dispositivos desconhecidos
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Nunca compartilhe sua senha ou códigos de verificação com ninguém
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* MFA Setup Wizard */}
      <MFASetupWizard
        open={showMFAWizard}
        onOpenChange={setShowMFAWizard}
        onComplete={handleMFAComplete}
      />
    </div>
  );
};

export default ProfessionalSecurity;
