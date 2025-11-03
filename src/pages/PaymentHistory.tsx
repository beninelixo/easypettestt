import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, DollarSign, Calendar, Receipt, FileText, Loader2, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  appointment: {
    scheduled_date: string;
    scheduled_time: string;
    service: {
      name: string;
    };
    pet: {
      name: string;
    };
  };
}

const PaymentHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;

    try {
      const { data: appointmentsData, error } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          service:services(name),
          pet:pets(name),
          payments!inner(
            id,
            amount,
            payment_method,
            status,
            paid_at,
            created_at
          )
        `)
        .eq("client_id", user.id)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;

      // Flatten the data structure
      const paymentsData = appointmentsData?.flatMap(apt => 
        (apt as any).payments.map((payment: any) => ({
          ...payment,
          appointment: {
            scheduled_date: apt.scheduled_date,
            scheduled_time: apt.scheduled_time,
            service: (apt as any).service,
            pet: (apt as any).pet,
          }
        }))
      ) || [];

      setPayments(paymentsData);

      // Calculate total spent
      const total = paymentsData
        .filter(p => p.status === 'pago')
        .reduce((sum, p) => sum + p.amount, 0);
      setTotalSpent(total);
    } catch (error: any) {
      console.error("Error loading payments:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return <Badge className="bg-green-600 hover:bg-green-700">Pago</Badge>;
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cartao_credito":
      case "cartao_debito":
        return <CreditCard className="h-4 w-4" />;
      case "pix":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      dinheiro: "Dinheiro",
      cartao_credito: "Cartão de Crédito",
      cartao_debito: "Cartão de Débito",
      pix: "PIX",
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
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
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-5xl space-y-6">
        {/* Summary Card */}
        <Card className="border-2 shadow-xl bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Total Gasto</p>
                <p className="text-3xl font-bold text-primary">
                  R$ {totalSpent.toFixed(2)}
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt className="h-6 w-6 text-secondary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Total de Pagamentos</p>
                <p className="text-3xl font-bold text-secondary">
                  {payments.length}
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Pagamentos Concluídos</p>
                <p className="text-3xl font-bold text-green-600">
                  {payments.filter(p => p.status === 'pago').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Histórico de Pagamentos
            </CardTitle>
            <CardDescription>
              Todos os seus pagamentos e transações
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground mb-4">Nenhum pagamento encontrado</p>
                <Button onClick={() => navigate("/select-petshop")}>
                  Fazer Primeiro Agendamento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Card 
                    key={payment.id}
                    className="border-2 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold text-lg">
                              {payment.appointment.service?.name}
                            </h4>
                            {getStatusBadge(payment.status)}
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              {getPaymentMethodIcon(payment.payment_method)}
                              <span>
                                <strong>Método:</strong> {getPaymentMethodLabel(payment.payment_method)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>
                                {format(new Date(payment.appointment.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            <strong>Pet:</strong> {payment.appointment.pet?.name}
                          </p>
                          
                          {payment.paid_at && (
                            <p className="text-xs text-green-600 font-medium">
                              ✓ Pago em {format(new Date(payment.paid_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Valor</p>
                            <p className="text-2xl font-bold text-primary">
                              R$ {payment.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentHistory;
