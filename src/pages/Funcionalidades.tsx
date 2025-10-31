import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Clock, Users, TrendingUp, Package, CreditCard, 
  FileText, Bell, BarChart3, Shield, Smartphone, Zap,
  MessageSquare, Camera, Database, Settings, CheckCircle, Star
} from "lucide-react";

const Funcionalidades = () => {
  const features = [
    {
      category: "Agendamento",
      icon: Calendar,
      items: [
        { icon: Clock, title: "Agenda Inteligente", description: "Visualização diária, semanal e mensal com código de cores" },
        { icon: Bell, title: "Lembretes Automáticos", description: "WhatsApp e SMS para reduzir faltas em até 70%" },
        { icon: Calendar, title: "Bloqueio de Horários", description: "Defina intervalos, férias e horários especiais" },
        { icon: CheckCircle, title: "Confirmação Online", description: "Cliente confirma presença direto pelo celular" },
      ]
    },
    {
      category: "Clientes e Pets",
      icon: Users,
      items: [
        { icon: Users, title: "Cadastro Completo", description: "Histórico detalhado com fotos e documentos" },
        { icon: Camera, title: "Galeria de Fotos", description: "Antes e depois dos serviços realizados" },
        { icon: FileText, title: "Prontuário Digital", description: "Anotações, alergias e preferências" },
        { icon: Star, title: "Programa de Fidelidade", description: "Pontos, descontos e recompensas automáticas" },
      ]
    },
    {
      category: "Financeiro",
      icon: CreditCard,
      items: [
        { icon: CreditCard, title: "Múltiplas Formas de Pagamento", description: "Dinheiro, cartão, PIX e parcelamento" },
        { icon: TrendingUp, title: "Controle de Comissões", description: "Cálculo automático por funcionário ou serviço" },
        { icon: BarChart3, title: "Relatórios Financeiros", description: "Faturamento, despesas e lucro em tempo real" },
        { icon: FileText, title: "Emissão de Notas", description: "Integração com sistemas de NF-e" },
      ]
    },
    {
      category: "Estoque e Produtos",
      icon: Package,
      items: [
        { icon: Package, title: "Controle de Estoque", description: "Entrada, saída e alertas de reposição" },
        { icon: BarChart3, title: "Análise de Produtos", description: "Produtos mais vendidos e margem de lucro" },
        { icon: Bell, title: "Alerta de Validade", description: "Notificação de produtos próximos ao vencimento" },
        { icon: Database, title: "Inventário Rápido", description: "Contagem e ajuste facilitado" },
      ]
    },
    {
      category: "Relatórios e Análises",
      icon: BarChart3,
      items: [
        { icon: TrendingUp, title: "Dashboard Executivo", description: "Visão geral do negócio em tempo real" },
        { icon: Users, title: "Análise de Clientes", description: "Frequência, ticket médio e churn" },
        { icon: Calendar, title: "Ocupação da Agenda", description: "Taxa de ocupação e horários de pico" },
        { icon: CreditCard, title: "Fluxo de Caixa", description: "Previsão de receitas e despesas" },
      ]
    },
    {
      category: "Comunicação",
      icon: MessageSquare,
      items: [
        { icon: MessageSquare, title: "WhatsApp Integrado", description: "Envio em massa e automático" },
        { icon: Bell, title: "Campanhas de Marketing", description: "Promoções e novidades segmentadas" },
        { icon: Star, title: "Pesquisa de Satisfação", description: "Colete feedback automaticamente" },
        { icon: MessageSquare, title: "Chat Interno", description: "Comunicação entre equipe" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Zap className="h-4 w-4" />
            Funcionalidades Completas
          </div>
          <h1 className="text-5xl font-bold">
            Tudo que você precisa para gerir seu{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              pet shop
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema completo com mais de 50 funcionalidades para transformar a gestão do seu negócio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary-light">
                Começar Grátis por 14 dias
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl space-y-20">
          {features.map((category, idx) => (
            <div key={idx} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <category.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{category.category}</h2>
                  <p className="text-muted-foreground">
                    Ferramentas essenciais para {category.category.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.items.map((item, itemIdx) => (
                  <Card
                    key={itemIdx}
                    className="border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                        <item.icon className="h-6 w-6 text-accent" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{item.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">E muito mais...</h2>
            <p className="text-xl text-muted-foreground">
              Recursos adicionais que fazem a diferença no dia a dia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border text-center p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Segurança Total</h3>
              <p className="text-muted-foreground">
                Backup automático diário e criptografia de dados
              </p>
            </Card>

            <Card className="border-border text-center p-6">
              <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Acesso Mobile</h3>
              <p className="text-muted-foreground">
                Gerencie de qualquer lugar, tablet ou smartphone
              </p>
            </Card>

            <Card className="border-border text-center p-6">
              <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Personalizável</h3>
              <p className="text-muted-foreground">
                Adapte o sistema às necessidades do seu negócio
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6 max-w-3xl">
          <h2 className="text-4xl font-bold">
            Pronto para revolucionar sua gestão?
          </h2>
          <p className="text-xl opacity-90">
            Comece gratuitamente hoje e veja a diferença que um sistema completo faz
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Experimentar Grátis por 14 Dias
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Funcionalidades;
