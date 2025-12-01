import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Shield, Lock, ArrowLeft } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useRememberMe } from "@/hooks/useRememberMe";
import { AuthIllustration } from "@/components/auth/AuthIllustration";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { getCSRFToken, clearCSRFToken } from "@/lib/csrf";
import { signInWithGoogle } from "@/lib/auth/googleOAuth";
import logo from "@/assets/easypet-logo.png";

// Validation Schemas - Login accepts any password, registration enforces complexity
const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(1, "Senha é obrigatória").max(100, "Senha muito longa"),
});

const registerClientSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  password: z.string()
    .min(10, "Senha deve ter no mínimo 10 caracteres")
    .max(50, "Senha muito longa")
    .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra MAIÚSCULA")
    .regex(/[0-9]/, "Deve conter pelo menos um número")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Deve conter pelo menos um caractere especial"),
  confirmPassword: z.string(),
  full_name: z.string().trim().min(2, "Nome completo é obrigatório").max(100, "Nome muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(15, "Telefone muito longo"),
  acceptTerms: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const registerProfessionalSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  password: z.string()
    .min(10, "Senha deve ter no mínimo 10 caracteres")
    .max(50, "Senha muito longa")
    .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra MAIÚSCULA")
    .regex(/[0-9]/, "Deve conter pelo menos um número")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Deve conter pelo menos um caractere especial"),
  confirmPassword: z.string(),
  full_name: z.string().trim().min(2, "Nome do responsável é obrigatório").max(100, "Nome muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(15, "Telefone muito longo"),
  petShopName: z.string().trim().min(2, "Nome do petshop é obrigatório").max(100, "Nome muito longo"),
  petShopAddress: z.string().trim().min(5, "Endereço é obrigatório").max(200, "Endereço muito longo"),
  petShopCity: z.string().trim().min(2, "Cidade é obrigatória").max(100, "Cidade muito longa"),
  petShopState: z.string().trim().length(2, "Estado deve ter 2 letras (ex: SP)").toUpperCase(),
  acceptTerms: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const Auth = () => {
  // Login states
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  
  // Register common states
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [userType, setUserType] = useState<"client" | "pet_shop">("client");
  
  // Professional-specific states
  const [petShopName, setPetShopName] = useState("");
  const [petShopAddress, setPetShopAddress] = useState("");
  const [petShopCity, setPetShopCity] = useState("");
  const [petShopState, setPetShopState] = useState("");
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { signIn, user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { savedEmail, saveRememberMe } = useRememberMe();
  const [rememberMeChecked, setRememberMeChecked] = useState(false);

  // Refs for auto-focus
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const registerNameRef = useRef<HTMLInputElement>(null);

  // Rate limiting for login attempts
  const loginRateLimit = useRateLimit('login', {
    maxAttempts: 5,
    windowMs: 60000,
    blockDurationMs: 300000,
  });

  // Handle Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle({
        redirectTo: `${window.location.origin}/auth/callback`,
      });
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Erro ao conectar com Google",
        description: error.message || "Não foi possível conectar com sua conta Google. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Load saved email on mount
  useEffect(() => {
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMeChecked(true);
    }
  }, [savedEmail]);

  // Immediate redirect for authenticated users - let AppAuthRedirectGate handle it
  useEffect(() => {
    console.log('🔄 Auth page check:', { loading, user: user?.email, userRole });
    
    // ✅ FIXED: Wait for loading to complete before redirecting
    // This prevents invalid JWT tokens and auth loops
    if (!loading && user) {
      console.log('✅ Auth page: User authenticated and loading complete, redirecting to home (Gate will handle dashboard routing)');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const getDashboardRoute = (role: UserRole) => {
    switch (role) {
      case "client":
        return "/client/pets";
      case "pet_shop":
        return "/professional/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Server-side rate limiting check
      const { data: rateLimitData, error: rateLimitError } = await supabase.functions.invoke(
        'validate-login',
        {
          body: {
            email: loginEmail,
            ip_address: window.location.hostname,
            user_agent: navigator.userAgent,
          },
        }
      );

      if (rateLimitError) {
        let errorMsg = 'Erro ao validar login. ';
        let errorTitle = "⚠️ Erro de Validação";
        
        // Check if the error response indicates rate limiting (429 or blocked status)
        const isRateLimited = rateLimitError.message.includes('429') || 
                             rateLimitError.message.includes('rate limit') ||
                             rateLimitError.message.includes('Too many');
        
        if (isRateLimited) {
          errorTitle = "⏱️ Muitas Tentativas";
          errorMsg = 'Você excedeu o limite de tentativas de login. Por favor, aguarde alguns minutos antes de tentar novamente.';
        } else if (rateLimitError.message.includes('non-2xx')) {
          // Could still be rate limiting - check error context
          errorTitle = "⏱️ Acesso Temporariamente Bloqueado";
          errorMsg = 'Muitas tentativas de login detectadas. Aguarde 15 minutos antes de tentar novamente.';
        } else if (rateLimitError.message.includes('network')) {
          errorTitle = "📡 Erro de Conexão";
          errorMsg = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (rateLimitError.message.includes('timeout')) {
          errorTitle = "⏱️ Tempo Esgotado";
          errorMsg = 'A requisição demorou muito. Tente novamente.';
        } else {
          errorMsg = rateLimitError.message;
        }
        
        toast({
          title: errorTitle,
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (rateLimitData && !rateLimitData.allowed) {
        toast({
          title: "⏱️ Muitas Tentativas",
          description: rateLimitData?.message || "Por favor, aguarde alguns minutos antes de tentar novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Attempt login
      const result = await signIn(loginEmail, loginPassword, rememberMeChecked);
      
      // Record login attempt
      await supabase.functions.invoke('record-login-attempt', {
        body: {
          email: loginEmail,
          success: !!result.data,
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent,
        },
      });

      if (result.data) {
        loginRateLimit.reset();
        saveRememberMe(rememberMeChecked, loginEmail);
        setFailedLoginAttempts(0);
      } else {
        // Incrementar contador de falhas
        const attempts = failedLoginAttempts + 1;
        setFailedLoginAttempts(attempts);
        
        // Avisar após 2 tentativas falhas
        if (attempts >= 2) {
          toast({
            title: "Atenção",
            description: `Você tem ${3 - attempts} tentativa(s) restante(s) antes do bloqueio temporário.`,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Incrementar contador mesmo em erros
      const attempts = failedLoginAttempts + 1;
      setFailedLoginAttempts(attempts);
      
      let errorMsg = 'Ocorreu um erro ao tentar fazer login. Tente novamente.';
      let errorTitle = "❌ Erro no Login";
      
      if (error?.message) {
        if (error.message.includes('non-2xx')) {
          errorTitle = '🌐 Servidor Indisponível';
          errorMsg = 'Servidor temporariamente indisponível. Aguarde alguns instantes e tente novamente.';
        } else if (error.message.includes('network')) {
          errorTitle = '📡 Erro de Conexão';
          errorMsg = 'Não foi possível conectar ao servidor. Verifique sua internet.';
        } else if (error.message.includes('timeout')) {
          errorTitle = '⏱️ Tempo Esgotado';
          errorMsg = 'A requisição demorou muito tempo. Tente novamente.';
        } else {
          errorMsg = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMsg,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate based on user type
    const schema = userType === "client" ? registerClientSchema : registerProfessionalSchema;
    
    const dataToValidate = userType === "client" 
      ? {
          email: registerEmail,
          password: registerPassword,
          confirmPassword,
          full_name: registerName,
          phone: registerPhone,
          acceptTerms,
        }
      : {
          email: registerEmail,
          password: registerPassword,
          confirmPassword,
          full_name: registerName,
          phone: registerPhone,
          petShopName,
          petShopAddress,
          petShopCity,
          petShopState,
          acceptTerms,
        };

    const validation = schema.safeParse(dataToValidate);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: registerName,
            phone: registerPhone,
            user_type: userType,
            ...(userType === "pet_shop" && {
              pet_shop_name: petShopName.trim(),
              pet_shop_address: petShopAddress.trim(),
              pet_shop_city: petShopCity.trim(),
              pet_shop_state: petShopState.trim().toUpperCase(),
            }),
          }
        }
      });

      if (error) throw error;

      toast({
        title: "🎉 Conta criada com sucesso!",
        description: userType === "client" 
          ? "Bem-vindo! Você será redirecionado para adicionar seus pets."
          : "Petshop cadastrado! Configure agora os serviços do seu negócio.",
      });

      // Redirect based on user type
      setTimeout(() => {
        if (userType === "pet_shop") {
          navigate("/petshop-dashboard");
        } else {
          navigate("/client/pets");
        }
      }, 1500);
    } catch (error: any) {
      let errorMessage = error.message;
      let errorTitle = "❌ Erro ao Criar Conta";
      
      // Map specific Supabase errors to user-friendly messages with better visuals
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        errorTitle = "📧 Email Já Cadastrado";
        errorMessage = "Este email já possui uma conta. Tente fazer login ou recuperar sua senha.";
      } else if (error.message.includes("weak password") || error.message.includes("Password")) {
        errorTitle = "🔒 Senha Não Segura";
        if (error.message.includes("pwned")) {
          errorMessage = "Esta senha foi encontrada em vazamentos de dados na internet e não é segura. Por favor, escolha uma senha completamente diferente que você nunca usou antes.";
        } else {
          errorMessage = "Senha muito fraca. Use pelo menos 8 caracteres combinando letras maiúsculas, minúsculas, números e símbolos especiais (@, #, $, etc.).";
        }
      } else if (error.message.includes("invalid email") || error.message.includes("Email")) {
        errorTitle = "📧 Email Inválido";
        errorMessage = "O formato do email está incorreto. Verifique se digitou corretamente.";
      } else if (error.message.includes("non-2xx")) {
        errorTitle = "🌐 Servidor Indisponível";
        errorMessage = "Servidor temporariamente indisponível. Aguarde alguns instantes e tente novamente.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorTitle = "📡 Erro de Conexão";
        errorMessage = "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
      } else if (error.message.includes("timeout")) {
        errorTitle = "⏱️ Tempo Esgotado";
        errorMessage = "A requisição demorou muito tempo. Tente novamente.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Set field-specific error if it's a password issue
      if (errorMessage.includes("senha") || errorMessage.includes("Senha") || errorMessage.includes("password") || errorMessage.includes("Password")) {
        setFormErrors(prev => ({ ...prev, password: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.03]" />
        <AuthIllustration />
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-6 animate-scale-in">
          {/* Back Button */}
          <div className="flex justify-start">
            <Link to="/">
              <Button 
                variant="ghost" 
                className="gap-2 hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para início
              </Button>
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="text-center space-y-3 lg:hidden">
            <Link to="/" className="inline-flex items-center justify-center gap-3 group">
              <div className="relative group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-2xl">
                  <img 
                    src={logo} 
                    alt="EasyPet Logo" 
                    className="h-10 w-auto drop-shadow-[0_0_8px_rgba(0,200,150,0.4)] object-contain"
                  />
                </div>
              </div>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EasyPet
              </h1>
              <p className="text-muted-foreground text-sm">Gestão profissional para seu negócio pet</p>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1.5 bg-muted/30 backdrop-blur-sm rounded-xl">
              <TabsTrigger 
                value="login" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Lock className="h-4 w-4 mr-2" />
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Shield className="h-4 w-4 mr-2" />
                Cadastrar
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-6">
              <Card className="border-2 shadow-2xl bg-card/50 backdrop-blur-sm">
                <form onSubmit={handleLogin}>
                  <CardHeader className="space-y-3 pb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-2">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Acesse sua Conta</CardTitle>
                    <CardDescription className="text-base">Entre com suas credenciais para continuar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input 
                        ref={loginEmailRef}
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required 
                        maxLength={255}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                        autoFocus
                      />
                      {formErrors.email && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <span className="text-xs">⚠️</span>
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                      <PasswordInput
                        id="password" 
                        placeholder="••••••••" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required 
                        maxLength={50}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                      />
                      {formErrors.password && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <span className="text-xs">⚠️</span>
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMeChecked}
                        onCheckedChange={(checked) => setRememberMeChecked(checked as boolean)}
                      />
                      <label
                        htmlFor="remember-me"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Permanecer conectado
                      </label>
                    </div>

                    {loginRateLimit.isBlocked && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Conta temporariamente bloqueada por segurança
                        </p>
                      </div>
                    )}

                  </CardContent>
                  <CardFooter className="flex flex-col gap-4 pt-6">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-[1.02] transition-all duration-300" 
                      disabled={isLoading || loginRateLimit.isBlocked}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Entrando...
                        </div>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Entrar
                        </>
                      )}
                    </Button>

                    {/* Separator */}
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    {/* Google Sign In Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-base font-medium border-2 hover:bg-accent transition-colors"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar com Google
                    </Button>

                    <Link
                      to="/reset-password"
                      className="text-sm text-primary hover:text-secondary hover:underline text-center w-full block transition-colors font-medium"
                    >
                      Esqueci minha senha
                    </Link>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="mt-6">
              <Card className="border-2 shadow-2xl bg-card/50 backdrop-blur-sm">
                <form onSubmit={handleRegister}>
                  <CardHeader className="space-y-3 pb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Crie sua Conta Grátis</CardTitle>
                    <CardDescription className="text-base">Comece agora - sem cartão de crédito necessário</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Account Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Você é:</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setUserType("client")}
                          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 ${
                            userType === "client"
                              ? "border-primary bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg scale-105"
                              : "border-border hover:border-primary/50 hover:bg-muted/30"
                          }`}
                        >
                          <span className="text-3xl">🐕</span>
                          <span className="font-bold">Cliente</span>
                          <span className="text-xs text-muted-foreground text-center leading-tight">
                            Quero agendar serviços para meu pet
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserType("pet_shop")}
                          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300 ${
                            userType === "pet_shop"
                              ? "border-primary bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg scale-105"
                              : "border-border hover:border-primary/50 hover:bg-muted/30"
                          }`}
                        >
                          <span className="text-3xl">🧼</span>
                          <span className="font-bold">Profissional</span>
                          <span className="text-xs text-muted-foreground text-center leading-tight">
                            Tenho um Comércio e quero gerenciar atendimentos
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Common Fields */}
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-sm font-medium">
                        {userType === "pet_shop" ? "Nome do Responsável *" : "Nome Completo *"}
                      </Label>
                      <Input 
                        ref={registerNameRef}
                        id="register-name" 
                        type="text" 
                        placeholder={userType === "pet_shop" ? "João Silva" : "Seu nome completo"} 
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required 
                        maxLength={100}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                      />
                      {formErrors.full_name && (
                        <p className="text-sm text-destructive">⚠️ {formErrors.full_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-phone" className="text-sm font-medium">
                        Telefone *
                      </Label>
                      <Input 
                        id="register-phone" 
                        type="tel" 
                        placeholder="(11) 99999-9999" 
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        required 
                        maxLength={15}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-destructive">⚠️ {formErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium">Email *</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required 
                        maxLength={255}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                      />
                      {formErrors.email && (
                        <p className="text-sm text-destructive">⚠️ {formErrors.email}</p>
                      )}
                    </div>

                    {/* Professional-specific fields */}
                    {userType === "pet_shop" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="petshop-name" className="text-sm font-medium">Nome do Petshop *</Label>
                          <Input 
                            id="petshop-name" 
                            type="text" 
                            placeholder="PetShop do João" 
                            value={petShopName}
                            onChange={(e) => setPetShopName(e.target.value)}
                            required 
                            maxLength={100}
                            className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                          />
                          {formErrors.petShopName && (
                            <p className="text-sm text-destructive">⚠️ {formErrors.petShopName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="petshop-address" className="text-sm font-medium">Endereço do Petshop *</Label>
                          <Input 
                            id="petshop-address" 
                            type="text" 
                            placeholder="Rua Exemplo, 123" 
                            value={petShopAddress}
                            onChange={(e) => setPetShopAddress(e.target.value)}
                            required 
                            maxLength={200}
                            className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                          />
                          {formErrors.petShopAddress && (
                            <p className="text-sm text-destructive">⚠️ {formErrors.petShopAddress}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="petshop-city" className="text-sm font-medium">Cidade *</Label>
                            <Input 
                              id="petshop-city" 
                              type="text" 
                              placeholder="São Paulo" 
                              value={petShopCity}
                              onChange={(e) => setPetShopCity(e.target.value)}
                              required 
                              maxLength={100}
                              className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                            />
                            {formErrors.petShopCity && (
                              <p className="text-sm text-destructive">⚠️ {formErrors.petShopCity}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="petshop-state" className="text-sm font-medium">Estado *</Label>
                            <Input 
                              id="petshop-state" 
                              type="text" 
                              placeholder="SP" 
                              value={petShopState}
                              onChange={(e) => setPetShopState(e.target.value.toUpperCase())}
                              required 
                              maxLength={2}
                              className="h-12 bg-background/50 border-2 focus:border-primary transition-colors uppercase"
                            />
                            {formErrors.petShopState && (
                              <p className="text-sm text-destructive">⚠️ {formErrors.petShopState}</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Password Fields */}
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium">Senha *</Label>
                      <PasswordInput
                        id="register-password" 
                        placeholder="••••••••" 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required 
                        maxLength={50}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                      />
                      {formErrors.password && (
                        <p className="text-sm text-destructive">⚠️ {formErrors.password}</p>
                      )}
                      {registerPassword && <PasswordStrengthIndicator password={registerPassword} />}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar Senha *</Label>
                      <PasswordInput
                        id="confirm-password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                        maxLength={50}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-destructive">⚠️ {formErrors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Terms acceptance */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="accept-terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <label
                        htmlFor="accept-terms"
                        className="text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Aceito os <Link to="/terms" className="text-primary hover:underline">Termos de Uso</Link> e a <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
                      </label>
                    </div>
                    {formErrors.acceptTerms && (
                      <p className="text-sm text-destructive">⚠️ {formErrors.acceptTerms}</p>
                    )}

                  </CardContent>
                  <CardFooter className="flex flex-col gap-4 pt-6">
                    <Button
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-[1.02] transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Criando conta...
                        </div>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-2" />
                          Criar Conta Grátis
                        </>
                      )}
                    </Button>

                    {/* Separator */}
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    {/* Google Sign Up Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-base font-medium border-2 hover:bg-accent transition-colors"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar com Google
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
