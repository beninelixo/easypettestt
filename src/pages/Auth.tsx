import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PawPrint } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(50, "Senha muito longa")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
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
    await signIn(loginEmail, loginPassword);
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validação adicional para profissionais
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

      // Redirect with pre-filled data for pet shop
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="w-full max-w-md space-y-6 animate-scale-in relative z-10">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center justify-center gap-3 group">
            <div className="bg-gradient-to-br from-primary to-primary-light text-primary-foreground p-4 rounded-2xl transition-all group-hover:scale-110 group-hover:shadow-xl">
              <PawPrint className="h-10 w-10" />
            </div>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mt-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bointhosa Pet System
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Gestão profissional para seu negócio pet</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
            <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-light data-[state=active]:text-primary-foreground">
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-light data-[state=active]:text-primary-foreground">
              Cadastrar
            </TabsTrigger>
          </TabsList>

            <TabsContent value="login">
            <Card className="border-2 shadow-xl">
              <form onSubmit={handleLogin}>
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl">Acesse sua Conta</CardTitle>
                  <CardDescription className="text-base">Entre com suas credenciais para continuar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                      maxLength={255}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-destructive">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                      maxLength={50}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-destructive">{formErrors.password}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full transition-all duration-300 hover:shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Entrando...
                      </div>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                  <Link
                    to="/reset-password"
                    className="text-sm text-primary hover:text-primary-light hover:underline text-center w-full block transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-2 shadow-xl">
              <form onSubmit={handleRegister}>
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl">Crie sua Conta Grátis</CardTitle>
                  <CardDescription className="text-base">Comece agora - sem cartão de crédito necessário</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Tipo de Conta</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType("client")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          userType === "client"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl">🐕</span>
                        <span className="font-semibold">Cliente</span>
                        <span className="text-xs text-muted-foreground text-center">
                          Quero agendar serviços para meu pet
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("pet_shop")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          userType === "pet_shop"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl">🧼</span>
                        <span className="font-semibold">Profissional</span>
                        <span className="text-xs text-muted-foreground text-center">
                          Tenho um petshop e quero gerenciar atendimentos
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">{userType === "pet_shop" ? "Nome do Responsável" : "Nome Completo"}</Label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Seu nome" 
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required 
                      maxLength={100}
                    />
                    {formErrors.full_name && (
                      <p className="text-sm text-destructive">{formErrors.full_name}</p>
                    )}
                  </div>

                  {userType === "pet_shop" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="petshop-name" className="flex items-center gap-2">
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
                        />
                        {formErrors.petShopName && (
                          <p className="text-sm text-destructive">{formErrors.petShopName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="petshop-city" className="flex items-center gap-2">
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
                        />
                        {formErrors.petShopCity && (
                          <p className="text-sm text-destructive">{formErrors.petShopCity}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required 
                      maxLength={255}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-destructive">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      placeholder="Mínimo 8 caracteres (maiúsculas, minúsculas, números)" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required 
                      maxLength={50}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-destructive">{formErrors.password}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ao criar uma conta, você concorda com nossos Termos de Serviço e Política de Privacidade.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full transition-all duration-300 hover:shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Criando conta...
                      </div>
                    ) : (
                      "Criar Conta Grátis"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
