import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Lock, CreditCard, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Configuracoes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: "Perfil do Negócio",
      description: "Edite as informações do seu pet shop",
      icon: Users,
      action: "Editar Perfil",
      onClick: () => navigate('/petshop-dashboard/editar-petshop'),
    },
    {
      title: "Notificações",
      description: "Configure lembretes e alertas",
      icon: Bell,
      action: "Configurar",
      onClick: () => toast({ title: "Funcionalidade em desenvolvimento", description: "Configurar notificações estará disponível em breve" }),
    },
    {
      title: "Segurança",
      description: "Altere sua senha e configurações de segurança",
      icon: Lock,
      action: "Gerenciar",
      onClick: () => toast({ title: "Funcionalidade em desenvolvimento", description: "Gerenciar segurança estará disponível em breve" }),
    },
    {
      title: "Pagamentos",
      description: "Configure métodos de pagamento e planos",
      icon: CreditCard,
      action: "Ver Planos",
      onClick: () => toast({ title: "Funcionalidade em desenvolvimento", description: "Ver Planos estará disponível em breve" }),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações do seu pet shop
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => (
          <Card key={index} className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{section.description}</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={section.onClick}
              >
                {section.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Configuracoes;
