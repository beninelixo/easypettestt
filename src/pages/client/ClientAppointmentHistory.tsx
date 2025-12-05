import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Filter, TrendingUp, Calendar, Clock, MapPin, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { RatingDialog } from "@/components/client/RatingDialog";
import { SEO } from "@/components/SEO";

export default function ClientAppointmentHistory() {
  const [dateFilter, setDateFilter] = useState<string>("30");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [petShopFilter, setPetShopFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['client-history', session?.user?.id, dateFilter, statusFilter, petShopFilter],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      let query = supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, price),
          pet:pets(name),
          pet_shop:pet_shops(id, name, city)
        `)
        .eq('client_id', session.user.id)
        .is('deleted_at', null);

      // Filtro de data
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        query = query.gte('scheduled_date', dateLimit.toISOString());
      }

      // Filtro de status
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Filtro de pet shop
      if (petShopFilter !== 'all') {
        query = query.eq('pet_shop_id', petShopFilter);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  // Realtime subscription for appointments
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('client-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `client_id=eq.${session.user.id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, refetch]);

  const handleOpenRating = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setRatingDialogOpen(true);
  };

  const { data: petShops } = useQuery({
    queryKey: ['client-petshops', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('pet_shop:pet_shops(id, name)')
        .eq('client_id', session.user.id);

      if (error) throw error;
      
      // Remover duplicatas
      const uniquePetShops = data?.reduce((acc: any[], curr) => {
        if (curr.pet_shop && !acc.find(ps => ps.id === curr.pet_shop.id)) {
          acc.push(curr.pet_shop);
        }
        return acc;
      }, []);
      
      return uniquePetShops || [];
    },
    enabled: !!session?.user?.id,
  });

  // Estatísticas
  const stats = {
    total: appointments?.length || 0,
    completed: appointments?.filter(a => a.status === 'completed').length || 0,
    cancelled: appointments?.filter(a => a.status === 'cancelled').length || 0,
    totalSpent: appointments
      ?.filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.service?.price || 0), 0) || 0,
  };

  // Dados para gráfico de status
  const statusData = [
    { name: 'Concluídos', value: stats.completed, color: '#22c55e' },
    { name: 'Cancelados', value: stats.cancelled, color: '#ef4444' },
    { name: 'Pendentes', value: appointments?.filter(a => a.status === 'pending').length || 0, color: '#f59e0b' },
    { name: 'Confirmados', value: appointments?.filter(a => a.status === 'confirmed').length || 0, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  // Dados para gráfico de serviços por mês
  const monthlyData = appointments?.reduce((acc: any, appointment) => {
    const month = format(new Date(appointment.scheduled_date), 'MMM', { locale: ptBR });
    const existing = acc.find((item: any) => item.month === month);
    
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ month, count: 1 });
    }
    
    return acc;
  }, []) || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      pending: { label: 'Pendente', variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
      confirmed: { label: 'Confirmado', variant: 'default', className: 'bg-blue-500' },
      completed: { label: 'Concluído', variant: 'secondary', className: 'bg-green-500 text-white' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return (
      <Badge 
        variant={statusInfo.variant} 
        className={statusInfo.className}
        role="status"
        aria-label={`Status: ${statusInfo.label}`}
      >
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6" role="status" aria-label="Carregando histórico">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Histórico de Agendamentos | EasyPet"
        description="Veja todo o histórico de serviços realizados para seus pets"
      />
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Histórico de Agendamentos
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Visualize e analise todos os seus agendamentos
          </p>
        </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" aria-hidden="true" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date-filter" className="text-sm font-medium mb-2 block">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date-filter" aria-label="Filtrar por período">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="60">Últimos 60 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="180">Últimos 6 meses</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="status-filter" className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" aria-label="Filtrar por status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="petshop-filter" className="text-sm font-medium mb-2 block">Pet Shop</label>
              <Select value={petShopFilter} onValueChange={setPetShopFilter}>
                <SelectTrigger id="petshop-filter" aria-label="Filtrar por pet shop">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {petShops?.map((ps: any) => (
                    <SelectItem key={ps.id} value={ps.id}>
                      {ps.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Estatísticas de agendamentos">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold" aria-label={`${stats.total} agendamentos no total`}>{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <CalendarIcon className="h-4 w-4 text-red-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-primary">R$ {stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Em serviços concluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por Status</CardTitle>
            <CardDescription>Distribuição de status dos agendamentos</CardDescription>
          </CardHeader>
          <CardContent role="img" aria-label="Gráfico de pizza mostrando distribuição de agendamentos por status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos por Mês</CardTitle>
            <CardDescription>Frequência de agendamentos ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Agendamentos ({appointments?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start justify-between border-l-2 border-primary pl-4 py-3 hover:bg-muted/50 transition-colors rounded-r"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{appointment.service?.name}</p>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pet: {appointment.pet?.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appointment.pet_shop?.name} - {appointment.pet_shop?.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(appointment.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.scheduled_time}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-primary">
                      R$ {appointment.service?.price?.toFixed(2)}
                    </p>
                    {appointment.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRating(appointment.id)}
                        className="gap-1 min-h-[44px]"
                        aria-label={`Avaliar serviço ${appointment.service?.name}`}
                      >
                        <Star className="h-4 w-4" aria-hidden="true" />
                        Avaliar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" role="status">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
              <p>Nenhum agendamento encontrado com os filtros selecionados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <RatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        appointmentId={selectedAppointment}
        onSuccess={() => refetch()}
      />
    </div>
    </>
  );
}
