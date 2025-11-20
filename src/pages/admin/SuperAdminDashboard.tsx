import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Building2, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Database,
  ServerCrash
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { SuperAdminUsers } from "@/components/admin/SuperAdminUsers";
import { SuperAdminPetShops } from "@/components/admin/SuperAdminPetShops";
import { SuperAdminSystemHealth } from "@/components/admin/SuperAdminSystemHealth";
import { SuperAdminLogs } from "@/components/admin/SuperAdminLogs";

interface SystemStats {
  total_users: number;
  total_pet_shops: number;
  total_appointments_today: number;
  errors_last_24h: number;
  warnings_last_24h: number;
}

const SuperAdminDashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && userRole !== 'admin') {
      navigate('/');
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (userRole === 'admin') {
      loadSystemStats();
    }
  }, [userRole]);

  const loadSystemStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_system_stats');
      if (error) throw error;
      if (data) {
        const statsData = data as unknown as SystemStats;
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error loading system stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO 
        title="Super Admin Dashboard - EasyPet"
        description="Painel de controle total do sistema EasyPet"
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Controle total do sistema EasyPet</p>
        </div>
        <Shield className="h-12 w-12 text-primary" />
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pet Shops Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_pet_shops || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_appointments_today || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros (24h)</CardTitle>
            <ServerCrash className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.errors_last_24h || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avisos (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats?.warnings_last_24h || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="petshops">Pet Shops</TabsTrigger>
          <TabsTrigger value="health">Saúde do Sistema</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <SuperAdminUsers />
        </TabsContent>

        <TabsContent value="petshops" className="space-y-4">
          <SuperAdminPetShops />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <SuperAdminSystemHealth />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <SuperAdminLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
