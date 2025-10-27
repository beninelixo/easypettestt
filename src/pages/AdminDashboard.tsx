import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, Calendar, DollarSign, TrendingUp, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
  const { signOut } = useAuth();

  const stats = [
    { title: "Pet Shops Ativos", value: "24", icon: Building2, color: "text-primary" },
    { title: "Clientes Total", value: "1.243", icon: Users, color: "text-secondary" },
    { title: "Agendamentos Hoje", value: "156", icon: Calendar, color: "text-accent" },
    { title: "Faturamento Mensal", value: "R$ 45.800", icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <Button onClick={signOut} variant="outline">Sair</Button>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Visão Geral do Sistema</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Ações Administrativas</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Building2 className="h-6 w-6" />
              Gerenciar Pet Shops
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              Gerenciar Usuários
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              Relatórios Completos
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Settings className="h-6 w-6" />
              Configurações do Sistema
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              Planos e Pagamentos
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              Todos os Agendamentos
            </Button>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Atividade Recente</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Novo Pet Shop cadastrado</h3>
                    <p className="text-sm text-muted-foreground">Pet Paradise - São Paulo, SP</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Há 2 horas</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Plano atualizado</h3>
                    <p className="text-sm text-muted-foreground">Pet Care Clinic - Upgrade para Pro</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Há 5 horas</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Pico de agendamentos</h3>
                    <p className="text-sm text-muted-foreground">156 agendamentos realizados hoje</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hoje</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
