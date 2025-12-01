import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Heart, Award, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function EnhancedClientDashboard() {
  const navigate = useNavigate();
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ['client-appointments', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, price),
          pet_shop:pet_shops(name, city)
        `)
        .eq('client_id', session.user.id)
        .order('scheduled_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  const { data: loyaltyPoints, isLoading: loadingPoints } = useQuery({
    queryKey: ['loyalty-points', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('client_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.points || 0;
    },
    enabled: !!session?.user?.id,
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'outline' },
      confirmed: { label: 'Confirmado', variant: 'default' },
      completed: { label: 'Concluído', variant: 'secondary' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loadingAppointments || loadingPoints) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const completedCount = appointments?.filter(a => a.status === 'completed').length || 0;
  const upcomingCount = appointments?.filter(a => 
    a.status === 'confirmed' && new Date(a.scheduled_date) >= new Date()
  ).length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Pontos de Fidelidade
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Award className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-primary tracking-tight">{loyaltyPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Próxima recompensa em {Math.max(0, 100 - (loyaltyPoints % 100))} pontos
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-t-4 border-t-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Serviços Realizados
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Heart className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de serviços concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-t-4 border-t-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Próximos Agendamentos
            </CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <Calendar className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Serviços agendados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Histórico de Agendamentos
          </CardTitle>
          <CardDescription>
            Seus últimos 5 agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start justify-between border-l-2 border-primary pl-4 py-2 hover:bg-muted/50 transition-colors rounded-r"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{appointment.service?.name}</p>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.pet_shop?.name} • {appointment.pet_shop?.city}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(appointment.scheduled_date), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.scheduled_time}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      R$ {appointment.service?.price?.toFixed(2)}
                    </p>
                    {appointment.status === 'completed' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/client/appointments')}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Avaliar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento ainda</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => navigate('/client/schedule')}
              >
                Fazer primeiro agendamento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programa de Fidelidade */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Programa de Fidelidade
          </CardTitle>
          <CardDescription>
            Acumule pontos e ganhe recompensas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso para próxima recompensa</span>
                <span className="font-medium">{((loyaltyPoints || 0) % 100)}/100 pontos</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((loyaltyPoints || 0) % 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{Math.floor((loyaltyPoints || 0) / 100)}</p>
                <p className="text-xs text-muted-foreground">Recompensas ganhas</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-accent">{completedCount * 10}</p>
                <p className="text-xs text-muted-foreground">Pontos totais ganhos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}