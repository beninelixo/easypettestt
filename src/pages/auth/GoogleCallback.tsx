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
        console.log('🔄 Processing Google OAuth callback...');
        
        const result = await handleGoogleCallback();

        if (!result) {
          throw new Error('Nenhum resultado retornado da autenticação Google');
        }

        console.log('✅ Google authentication successful');

        // Show welcome message
        toast({
          title: result.isNewUser ? "🎉 Bem-vindo ao EasyPet!" : "✅ Login realizado com sucesso!",
          description: result.isNewUser 
            ? "Sua conta foi criada com sucesso. Redirecionando..."
            : `Olá, ${result.user.email || 'Usuário'}!`,
        });

        // Small delay to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to home (AppAuthRedirectGate will handle role-based routing)
        console.log('🔄 Redirecting to home...');
        navigate('/', { replace: true });
      } catch (error: any) {
        console.error('❌ Google callback error:', error);
        
        let errorMessage = error.message || "Não foi possível completar o login com Google. Tente novamente.";
        
        // Handle specific error cases
        if (error.message?.includes('session')) {
          errorMessage = "Sessão não encontrada. Tente fazer login novamente.";
        } else if (error.message?.includes('network')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        }
        
        toast({
          title: "❌ Erro na autenticação Google",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Redirect back to auth page after error
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 2000);
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
