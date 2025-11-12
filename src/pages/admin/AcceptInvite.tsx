import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        setError("Token de convite inválido");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("admin_invites")
          .select("*")
          .eq("token", token)
          .single();

        if (error) throw error;

        if (!data) {
          setError("Convite não encontrado");
          return;
        }

        if (data.accepted) {
          setError("Este convite já foi aceito");
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setError("Este convite expirou");
          return;
        }

        setInvite(data);
      } catch (error: any) {
        console.error("Error loading invite:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!invite) return;

    setAccepting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Faça login primeiro",
          description: "Você precisa estar logado para aceitar o convite",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if emails match
      if (user.email !== invite.email) {
        toast({
          title: "Email não corresponde",
          description: `Este convite foi enviado para ${invite.email}. Faça login com este email para aceitar.`,
          variant: "destructive",
        });
        setAccepting(false);
        return;
      }

      // Chamar edge function segura para aceitar convite
      const { data, error } = await supabase.functions.invoke('accept-admin-invite', {
        body: { token: invite.token },
      });

      if (error) {
        let errorMessage = 'Erro ao aceitar convite';
        
        // Mensagens específicas por código de erro
        if (error.message?.includes('404') || error.message?.includes('não encontrado')) {
          errorMessage = 'Convite não encontrado';
        } else if (error.message?.includes('409') || error.message?.includes('já foi utilizado')) {
          errorMessage = 'Este convite já foi utilizado';
        } else if (error.message?.includes('410') || error.message?.includes('expirou')) {
          errorMessage = 'Este convite expirou';
        } else if (error.message?.includes('403') || error.message?.includes('outro email')) {
          errorMessage = 'Este convite foi enviado para outro email';
        }

        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
        setAccepting(false);
        return;
      }

      toast({
        title: "🎉 Convite aceito!",
        description: "Você agora é um administrador. Redirecionando...",
      });

      // Refresh page to update role
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 2000);

    } catch (error: any) {
      console.error("Error accepting invite:", error);
      toast({
        title: "Erro ao aceitar convite",
        description: error.message || "Erro ao processar sua solicitação",
        variant: "destructive",
      });
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Verificando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Convite Inválido</CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md border-primary shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Convite de Administrador</CardTitle>
          <CardDescription className="text-base">
            Você foi convidado para se tornar administrador do EasyPet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Email do convite</div>
              <div className="font-medium">{invite?.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Permissões que você receberá</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="destructive">🔥 Modo Deus</Badge>
                <Badge variant="default">📊 Monitoramento</Badge>
                <Badge variant="default">🛡️ Segurança</Badge>
                <Badge variant="default">⚙️ Configurações</Badge>
                <Badge variant="default">👥 Gerenciar Usuários</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAcceptInvite} 
              disabled={accepting}
              className="w-full h-12 text-base gap-2"
            >
              {accepting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Ativando permissões...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Aceitar e Ativar Admin
                </>
              )}
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="w-full"
              disabled={accepting}
            >
              Recusar Convite
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            Ao aceitar, você concorda em utilizar as permissões administrativas de forma responsável
          </div>
        </CardContent>
      </Card>
    </div>
  );
}