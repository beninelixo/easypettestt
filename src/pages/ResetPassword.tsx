import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";

const emailSchema = z.string().trim().email("Email inválido").max(255, "Email muito longo");

const passwordSchema = z.object({
  password: z.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(50, "Senha muito longa"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  
  // Form states
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    if (params.get('type') === 'recovery') {
      setStep('password');
      toast({
        title: "🔐 Link verificado",
        description: "Defina sua nova senha abaixo.",
      });
      history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setFormErrors({ email: "Email inválido" });
      return;
    }

    setIsLoading(true);
    try {
      // Envia email de recuperação nativo do backend (sem precisar de remetente personalizado)
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: (error as any).message || "Tente novamente em instantes.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✉️ Email enviado!",
        description: "Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.",
      });

      // Não avançamos de etapa aqui; o usuário usará o link recebido no email.
    } catch (error: any) {
      const errorMessage = error.message || "Não foi possível enviar o código. Tente novamente.";
      
      toast({
        title: "Erro ao enviar código",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (otpCode.length !== 6) {
      setFormErrors({ otp: "Código deve ter 6 dígitos" });
      return;
    }

    setIsLoading(true);
    try {
      // Verify code from database
      const { data: resetData, error: queryError } = await supabase
        .from('password_resets')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('code', otpCode)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (queryError) {
        console.error('Query error:', queryError);
        throw new Error('Erro ao verificar código');
      }

      if (!resetData) {
        throw new Error('Código inválido ou expirado');
      }

      toast({
        title: "✅ Código verificado!",
        description: "Agora defina sua nova senha.",
      });
      setStep("password");
    } catch (error: any) {
      toast({
        title: "❌ Código inválido",
        description: error.message || "Verifique se digitou o código corretamente ou se ele ainda é válido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = passwordSchema.safeParse({
      password: newPassword,
      confirmPassword: confirmPassword,
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
      // Atualiza a senha usando a sessão do link de recuperação
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: "🎉 Senha redefinida com sucesso!",
        description: "Você já pode fazer login com sua nova senha.",
      });

      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível redefinir a senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {step === "email" && <Mail className="w-8 h-8 text-primary" />}
            {step === "otp" && <ShieldCheck className="w-8 h-8 text-primary" />}
            {step === "password" && <KeyRound className="w-8 h-8 text-primary" />}
          </div>
          <div>
            <CardTitle className="text-2xl">
              {step === "email" && "Recuperar Senha"}
              {step === "otp" && "Verificar Código"}
              {step === "password" && "Nova Senha"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "Digite seu email para receber o link de recuperação"}
              {step === "otp" && "Digite o código de 6 dígitos enviado para seu email"}
              {step === "password" && "Defina sua nova senha de acesso"}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="bg-muted/40 border border-border rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground">
                  Enviaremos um link de recuperação para o seu email. Siga o link para definir uma nova senha.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">📧 Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="raulepic23@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-center block">🔢 Código de Verificação</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => setOtpCode(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {formErrors.otp && (
                  <p className="text-sm text-destructive text-center">{formErrors.otp}</p>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  Enviado para: <span className="font-medium">{email}</span>
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || otpCode.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar Código"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("email")}
                disabled={isLoading}
              >
                Alterar Email
              </Button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">🔑 Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">✅ Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  A senha deve ter no mínimo 6 caracteres.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
