import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { PawPrint, Loader2, Shield, Lock } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useRememberMe } from "@/hooks/useRememberMe";
import { AuthIllustration } from "@/components/auth/AuthIllustration";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

const authSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(50, "Senha muito longa")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  full_name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo").optional(),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [userType, setUserType] = useState<"client" | "pet_shop">("client");
  const [petShopName, setPetShopName] = useState("");
  const [petShopCity, setPetShopCity] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { rememberMe, savedEmail, saveRememberMe } = useRememberMe();
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

  // Load saved email on mount
  useEffect(() => {
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMeChecked(true);
    }
  }, [savedEmail]);

  useEffect(() => {
    if (!loading && user) {
      const metaRole = (user.user_metadata?.user_type as UserRole) || null;
      const role = userRole || metaRole || "client";
      const redirectTo = searchParams.get("redirect") || getDashboardRoute(role);
      navigate(redirectTo);
    }
  }, [user, userRole, loading, navigate, searchParams]);

  const getDashboardRoute = (role: UserRole) => {
    switch (role) {
      case "client":
        return "/client-dashboard";
      case "pet_shop":
        return "/petshop-setup";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const rateLimitCheck = loginRateLimit.checkLimit();
    if (!rateLimitCheck.allowed) {
      toast({
        title: "Muitas tentativas",
        description: rateLimitCheck.message,
        variant: "destructive",
      });
      return;
    }

    const validation = authSchema.safeParse({
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
    const result = await signIn(loginEmail, loginPassword, rememberMeChecked);
    
    if (result.data) {
      loginRateLimit.reset();
      // Save remember me preference
      saveRememberMe(rememberMeChecked, loginEmail);
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (userType === "pet_shop") {
      if (!petShopName.trim()) {
        setFormErrors({ petShopName: "Nome do petshop é obrigatório" });
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha o nome do petshop.",
          variant: "destructive",
        });
        return;
      }
      if (!petShopCity.trim()) {
        setFormErrors({ petShopCity: "Cidade é obrigatória" });
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha a cidade.",
          variant: "destructive",
        });
        return;
      }
    }

    const validation = authSchema.safeParse({
      email: registerEmail,
      password: registerPassword,
      full_name: registerName,
    });

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
            user_type: userType,
            pet_shop_name: userType === "pet_shop" ? petShopName.trim() : undefined,
            pet_shop_city: userType === "pet_shop" ? petShopCity.trim() : undefined,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado em instantes...",
      });

      if (userType === "pet_shop") {
        setTimeout(() => {
          navigate(`/petshop-setup?name=${encodeURIComponent(petShopName)}&city=${encodeURIComponent(petShopCity)}`);
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
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
          {/* Mobile Logo */}
          <div className="text-center space-y-3 lg:hidden">
            <Link to="/" className="inline-flex items-center justify-center gap-3 group">
              <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground p-4 rounded-2xl transition-all group-hover:scale-110 group-hover:shadow-xl">
                <PawPrint className="h-10 w-10" />
              </div>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Bointhosa Pet System
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

                    {/* Remember Me Checkbox */}
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
                      <Label className="text-sm font-medium">Tipo de Conta</Label>
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
                            Tenho um petshop e quero gerenciar atendimentos
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        {userType === "pet_shop" ? "Nome do Responsável" : "Nome Completo"}
                      </Label>
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="Seu nome" 
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required 
                        maxLength={100}
                        className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                      />
                      {formErrors.full_name && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <span className="text-xs">⚠️</span>
                          {formErrors.full_name}
                        </p>
                      )}
                    </div>

                    {/* Pet Shop Fields */}
                    {userType === "pet_shop" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="petshop-name" className="flex items-center gap-2 text-sm font-medium">
                            🏪 Nome do Petshop *
                          </Label>
                          <Input 
                            id="petshop-name" 
                            type="text" 
                            placeholder="Ex: PetChop do Zé" 
                            value={petShopName}
                            onChange={(e) => setPetShopName(e.target.value)}
                            required 
                            maxLength={100}
                            className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                          />
                          {formErrors.petShopName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="text-xs">⚠️</span>
                              {formErrors.petShopName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="petshop-city" className="flex items-center gap-2 text-sm font-medium">
                            🌆 Cidade *
                          </Label>
                          <Input 
                            id="petshop-city" 
                            type="text" 
                            placeholder="Ex: São Luís/MA" 
                            value={petShopCity}
                            onChange={(e) => setPetShopCity(e.target.value)}
                            required 
                            maxLength={100}
                            className="h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                          />
                          {formErrors.petShopCity && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <span className="text-xs">⚠️</span>
                              {formErrors.petShopCity}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
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
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <span className="text-xs">⚠️</span>
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium">Senha</Label>
                      <PasswordInput
                        id="register-password" 
                        placeholder="Mínimo 8 caracteres (maiúsculas, minúsculas, números)" 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
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

                    {/* Password Strength Indicator */}
                    {registerPassword && (
                      <PasswordStrengthIndicator password={registerPassword} />
                    )}

                    <p className="text-xs text-muted-foreground pt-2">
                      Ao criar uma conta, você concorda com nossos Termos de Serviço e Política de Privacidade.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-6">
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
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors font-medium">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
