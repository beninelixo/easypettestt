/**
 * Google OAuth Callback Page
 * Handles the redirect after Google authentication
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleGoogleCallback } from "@/lib/auth/googleOAuth";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await handleGoogleCallback();

        if (result) {
          // Show welcome message
          toast({
            title: result.isNewUser ? "Bem-vindo ao EasyPet!" : "Login realizado com sucesso!",
            description: result.isNewUser 
              ? "Sua conta foi criada. Vamos configurar seu perfil."
              : `Olá, ${result.user.email}!`,
          });

          // Redirect to home (AppAuthRedirectGate will handle role-based routing)
          navigate('/', { replace: true });
        } else {
          throw new Error('Falha na autenticação');
        }
      } catch (error: any) {
        console.error('Google callback error:', error);
        toast({
          title: "Erro na autenticação",
          description: error.message || "Não foi possível completar o login. Tente novamente.",
          variant: "destructive",
        });
        navigate('/auth', { replace: true });
      }
    };

    processCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Completando autenticação...</h2>
          <p className="text-muted-foreground">Por favor, aguarde um momento</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
