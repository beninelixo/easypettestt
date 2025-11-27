import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2, 
  CreditCard,
  Activity,
  PawPrint
} from "lucide-react";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export const UserDetailDialog = ({ open, onOpenChange, userId }: UserDetailDialogProps) => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUserDetails();
    }
  }, [open, userId]);

  const loadUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Fetch role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      // Fetch pet shop if owner
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("*")
        .eq("owner_id", userId)
        .maybeSingle();

      // Fetch pets
      const { data: pets } = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", userId);

      // Fetch recent appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          *,
          pet:pets(name),
          service:services(name, price),
          pet_shop:pet_shops(name)
        `)
        .eq("client_id", userId)
        .order("scheduled_date", { ascending: false })
        .limit(5);

      // Fetch access audit logs
      const { data: auditLogs } = await supabase
        .from("access_audit")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      setUserDetails({
        profile,
        role: roleData?.role,
        petShop,
        pets: pets || [],
        appointments: appointments || [],
        auditLogs: auditLogs || [],
      });
    } catch (error) {
      console.error("Error loading user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userDetails || loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Carregando detalhes...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { profile, role, petShop, pets, appointments, auditLogs } = userDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Usuário
          </DialogTitle>
          <DialogDescription>
            Visualização completa do cadastro e atividades
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Nome:</span>
                  <span>{profile.full_name || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{profile.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span>
                  <span>{profile.phone || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Endereço:</span>
                  <span>{profile.address || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cadastrado em:</span>
                  <span>
                    {profile.created_at 
                      ? format(new Date(profile.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : "Não disponível"
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Role:</span>
                  <Badge variant={role === 'admin' ? 'destructive' : 'secondary'}>
                    {role || 'Sem role'}
                  </Badge>
                </div>
                {profile.is_blocked && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Usuário Bloqueado</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pet Shop Info */}
            {petShop && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Pet Shop
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Nome:</span>
                    <span>{petShop.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Plano:</span>
                    <Badge variant={
                      petShop.subscription_plan === 'platinum' ? 'default' :
                      petShop.subscription_plan === 'gold' ? 'secondary' : 'outline'
                    }>
                      {petShop.subscription_plan || 'Free'}
                    </Badge>
                  </div>
                  {petShop.subscription_expires_at && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Expira em:</span>
                      <span>
                        {format(new Date(petShop.subscription_expires_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Código:</span>
                    <code className="px-2 py-1 bg-muted rounded">{petShop.code}</code>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pets */}
            {pets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PawPrint className="h-4 w-4" />
                    Pets ({pets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pets.map((pet: any) => (
                      <div key={pet.id} className="flex items-center justify-between p-2 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {pet.species} • {pet.breed || 'Raça não informada'}
                          </p>
                        </div>
                        {pet.age && (
                          <Badge variant="outline">{pet.age} anos</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Appointments */}
            {appointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agendamentos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {appointments.map((apt: any) => (
                      <div key={apt.id} className="flex items-center justify-between p-2 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{apt.service?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.scheduled_date), "dd/MM/yyyy", { locale: ptBR })} • {apt.pet_shop?.name}
                          </p>
                        </div>
                        <Badge variant={
                          apt.status === 'completed' ? 'default' :
                          apt.status === 'confirmed' ? 'secondary' : 'outline'
                        }>
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Logs */}
            {auditLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Logs de Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-2 border border-border rounded-lg text-sm">
                        <div>
                          <p className="font-medium">{log.module} - {log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.success ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
