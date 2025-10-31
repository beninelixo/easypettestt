import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ComparisonTable = () => {
  const features = [
    { name: "Agendamento Online 24/7", bointhosa: true, traditional: false },
    { name: "Lembretes Automáticos WhatsApp", bointhosa: true, traditional: false },
    { name: "Dashboard de Análises", bointhosa: true, traditional: false },
    { name: "Cadastro de Clientes e Pets", bointhosa: true, traditional: true },
    { name: "Controle Financeiro", bointhosa: true, traditional: false },
    { name: "Relatórios em Tempo Real", bointhosa: true, traditional: false },
    { name: "Backup Automático", bointhosa: true, traditional: false },
    { name: "Suporte Especializado", bointhosa: true, traditional: false },
    { name: "App Mobile", bointhosa: true, traditional: false },
    { name: "Atualizações Constantes", bointhosa: true, traditional: false },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">Por Que Escolher o Bointhosa?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare e veja como deixamos métodos tradicionais para trás
          </p>
        </div>

        <Card className="border shadow-lg overflow-hidden bg-card">
          <CardHeader className="bg-primary text-primary-foreground py-6">
            <div className="grid grid-cols-3 gap-4">
              <CardTitle className="text-base md:text-lg font-semibold">Funcionalidade</CardTitle>
              <CardTitle className="text-base md:text-lg font-semibold text-center">Bointhosa</CardTitle>
              <CardTitle className="text-base md:text-lg font-semibold text-center">Métodos Tradicionais</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 gap-4 p-4 hover:bg-accent/5 transition-colors duration-200 ${
                  index !== features.length - 1 ? "border-b border-border" : ""
                } ${index % 2 === 0 ? "bg-muted/30" : "bg-card"}`}
              >
                <div className="font-medium text-card-foreground flex items-center">{feature.name}</div>
                <div className="flex justify-center items-center">
                  {feature.bointhosa ? (
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center border-2 border-green-500">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center border-2 border-red-500">
                      <X className="h-6 w-6 text-red-600 dark:text-red-400 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="flex justify-center items-center">
                  {feature.traditional ? (
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center border-2 border-green-500">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center border-2 border-red-500">
                      <X className="h-6 w-6 text-red-600 dark:text-red-400 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
          <p className="text-2xl font-bold mb-4">
            Economia de até <span className="text-primary">8 horas por semana</span> na gestão
          </p>
          <p className="text-muted-foreground">
            Automatize processos e foque no que realmente importa: seus clientes e pets
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
