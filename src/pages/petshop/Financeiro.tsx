import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, CreditCard, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Financeiro = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalPending: 0,
    totalCancelled: 0,
  });

  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user]);

  const loadFinancialData = async () => {
    const { data: petShop } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();

    if (petShop) {
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_date,
          service:services(name, price),
          payments(*)
        `)
        .eq("pet_shop_id", petShop.id)
        .order("scheduled_date", { ascending: false })
        .limit(50);

      if (appointmentsData) {
        const allPayments = appointmentsData.flatMap(a => a.payments || []);
        setPayments(allPayments);

        const received = allPayments
          .filter(p => p.status === "pago")
          .reduce((sum, p) => sum + Number(p.amount), 0);

        const pending = allPayments
          .filter(p => p.status === "pendente")
          .reduce((sum, p) => sum + Number(p.amount), 0);

        const cancelled = allPayments
          .filter(p => p.status === "cancelado")
          .reduce((sum, p) => sum + Number(p.amount), 0);

        setStats({
          totalReceived: received,
          totalPending: pending,
          totalCancelled: cancelled,
        });
      }
    }
  };

  const paymentMethodData = [
    { name: "PIX", value: payments.filter(p => p.payment_method === "pix" && p.status === "pago").length },
    { name: "Cartão", value: payments.filter(p => ["credito", "debito"].includes(p.payment_method) && p.status === "pago").length },
    { name: "Dinheiro", value: payments.filter(p => p.payment_method === "dinheiro" && p.status === "pago").length },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-primary" />
          Gestão Financeira
        </h1>
        <p className="text-muted-foreground mt-1">Controle completo das suas finanças</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              R$ {stats.totalReceived.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pagamentos confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <Wallet className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              R$ {stats.totalPending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pagamentos pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelado</CardTitle>
            <CreditCard className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              R$ {stats.totalCancelled.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pagamentos cancelados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="methods">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Mensal</CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total de Transações</span>
                    <span className="font-bold">{payments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Taxa de Conversão</span>
                    <span className="font-bold text-primary">
                      {payments.length > 0 
                        ? ((payments.filter(p => p.status === "pago").length / payments.length) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ticket Médio</span>
                    <span className="font-bold text-secondary">
                      R$ {payments.length > 0 
                        ? (stats.totalReceived / payments.filter(p => p.status === "pago").length).toFixed(2) 
                        : "0.00"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento Aceitos</CardTitle>
              <CardDescription>Configure as formas de pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto"].map((method) => (
                <div key={method} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">{method}</span>
                  <span className="text-primary">Ativo</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Últimas 50 transações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.slice(0, 20).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all">
                    <div>
                      <p className="font-medium">R$ {Number(payment.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{payment.payment_method}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      payment.status === "pago" 
                        ? "bg-primary/10 text-primary"
                        : payment.status === "pendente"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {payment.status === "pago" ? "Pago" : payment.status === "pendente" ? "Pendente" : "Cancelado"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;