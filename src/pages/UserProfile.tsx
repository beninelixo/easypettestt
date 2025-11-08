import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MFASetupWizard } from "@/components/mfa/MFASetupWizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, User, Mail, Phone, Camera, Save, Shield, Lock } from "lucide-react";
import { z } from "zod";
import { useMFA } from "@/hooks/useMFA";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(15, "Telefone muito longo"),
});

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const { checkMFAStatus } = useMFA();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
    loadMFAStatus();
  }, [user]);

  const loadMFAStatus = async () => {
    const status = await checkMFAStatus();
    setMfaEnabled(status);
  };

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = profileSchema.safeParse(formData);
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

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          avatar_url: formData.avatar_url,
        })
        .eq("id", user!.id);

      if (error) throw error;

      toast({
        title: "✅ Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl">Meu Perfil</CardTitle>
                <CardDescription className="text-base">
                  Gerencie suas informações pessoais
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                  <AvatarImage src={formData.avatar_url || undefined} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    {formData.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Alterar Foto
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Formatos aceitos: JPG, PNG (máx 2MB)
                </p>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="h-12 bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Nome Completo *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                  maxLength={100}
                  className="h-12"
                />
                {formErrors.full_name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">⚠️</span>
                    {formErrors.full_name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                  maxLength={15}
                  className="h-12"
                />
                {formErrors.phone && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-xs">⚠️</span>
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* MFA Section */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Autenticação de Dois Fatores (MFA)</h3>
                      <p className="text-sm text-muted-foreground">
                        Proteja sua conta com verificação em duas etapas
                      </p>
                    </div>
                  </div>
                  {mfaEnabled ? (
                    <Badge variant="default" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline">Inativo</Badge>
                  )}
                </div>
                <Button 
                  type="button"
                  variant={mfaEnabled ? "outline" : "default"}
                  onClick={() => setShowMFASetup(true)}
                  className="w-full"
                >
                  {mfaEnabled ? "Reconfigurar MFA" : "Ativar MFA"}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 font-semibold gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <MFASetupWizard 
          open={showMFASetup}
          onOpenChange={setShowMFASetup}
          onComplete={() => {
            setShowMFASetup(false);
            loadMFAStatus();
          }}
        />
      </div>
    </div>
  );
};

export default UserProfile;
