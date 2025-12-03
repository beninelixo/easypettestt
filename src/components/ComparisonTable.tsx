import { Check, X, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ComparisonTable = () => {
  const features = [
    { name: "Agendamento Online 24/7", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Gestão de Clientes e Pets", gold: true, platinum: true, annual: true, traditional: true },
    { name: "Calendário e Agenda", gold: true, platinum: true, annual: true, traditional: true },
    { name: "Controle de Estoque", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Relatórios Financeiros", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Lembretes Automáticos Email", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Lembretes WhatsApp Business", gold: false, platinum: true, annual: true, traditional: false },
    { name: "Programa de Fidelidade", gold: false, platinum: true, annual: true, traditional: false },
    { name: "Multi-unidades (Franquias)", gold: false, platinum: true, annual: true, traditional: false },
    { name: "API para Integrações", gold: false, platinum: true, annual: true, traditional: false },
    { name: "White Label (Marca Própria)", gold: false, platinum: true, annual: true, traditional: false },
    { name: "Backup Automático", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Suporte Especializado", gold: true, platinum: true, annual: true, traditional: false },
    { name: "App Mobile", gold: true, platinum: true, annual: true, traditional: false },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">Por Que Escolher o EasyPet?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare e veja como deixamos métodos tradicionais para trás
          </p>
        </div>

        <Card className="border shadow-lg overflow-x-auto bg-card">
          <CardHeader className="bg-primary text-primary-foreground py-6">
            <div className="grid grid-cols-5 gap-2 min-w-[800px]">
              <CardTitle className="text-sm md:text-base font-semibold">Funcionalidade</CardTitle>
              <CardTitle className="text-sm md:text-base font-semibold text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold mb-2">
                  <Crown className="h-3 w-3" />
                  POPULAR
                </div>
                <div>Pet Gold</div>
                <div className="text-xs mt-1 opacity-90">R$ 79,90/mês</div>
              </CardTitle>
              <CardTitle className="text-sm md:text-base font-semibold text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-400 text-white rounded-full text-xs font-bold mb-2">
                  💎 PREMIUM
                </div>
                <div>Pet Platinum</div>
                <div className="text-xs mt-1 opacity-90">R$ 149,90/mês</div>
              </CardTitle>
              <CardTitle className="text-sm md:text-base font-semibold text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold mb-2">
                  💰 ECONOMIA
                </div>
                <div>Platinum Anual</div>
                <div className="text-xs mt-1 opacity-90">R$ 1.798/ano</div>
              </CardTitle>
              <CardTitle className="text-sm md:text-base font-semibold text-center">Métodos Tradicionais</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-w-[800px]">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-5 gap-2 p-4 hover:bg-accent/5 transition-colors duration-200 ${
                    index !== features.length - 1 ? "border-b border-border" : ""
                  } ${index % 2 === 0 ? "bg-muted/30" : "bg-card"}`}
                >
                  <div className="font-medium text-card-foreground flex items-center text-sm">{feature.name}</div>
                  <div className="flex justify-center items-center">
                    {feature.gold ? (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center border-2 border-green-500">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center border-2 border-red-500">
                        <X className="h-5 w-5 text-red-600 dark:text-red-400 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-center">
                    {feature.platinum ? (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center border-2 border-green-500">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center border-2 border-red-500">
                        <X className="h-5 w-5 text-red-600 dark:text-red-400 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-center">
                    {feature.annual ? (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center border-2 border-green-500">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center border-2 border-red-500">
                        <X className="h-5 w-5 text-red-600 dark:text-red-400 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-center">
                    {feature.traditional ? (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center border-2 border-green-500">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center border-2 border-red-500">
                        <X className="h-5 w-5 text-red-600 dark:text-red-400 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Escolha Seu Plano Ideal</h3>
            <p className="text-muted-foreground">Cancele quando quiser. Garantia de 7 dias.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card Pet Gold */}
            <Card className="border-4 border-yellow-500 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-4 py-1 rounded-bl-lg text-xs font-bold">
                POPULAR
              </div>
              <CardHeader className="text-center pt-8">
                <div className="text-4xl mb-2">🏆</div>
                <CardTitle className="text-2xl">Plano Pet Gold</CardTitle>
                <div className="text-4xl font-black mt-4">R$ 79,90<span className="text-lg font-normal">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">✅ Agendamentos ilimitados</li>
                  <li className="flex items-center gap-2">✅ Até 3 usuários</li>
                  <li className="flex items-center gap-2">✅ Gestão completa de clientes</li>
                  <li className="flex items-center gap-2">✅ Relatórios básicos</li>
                  <li className="flex items-center gap-2">✅ Lembretes por email</li>
                </ul>
                <a href="https://pay.cakto.com.br/f72gob9_634441" target="_blank" rel="noopener noreferrer" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold">
                    🏆 Começar Agora
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Card Pet Platinum */}
            <Card className="border-2 border-slate-400 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">💎</div>
                <CardTitle className="text-2xl">Plano Pet Platinum</CardTitle>
                <div className="text-4xl font-black mt-4">R$ 149,90<span className="text-lg font-normal">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">✅ Tudo do Gold +</li>
                  <li className="flex items-center gap-2">✅ Até 5 usuários</li>
                  <li className="flex items-center gap-2">✅ WhatsApp Business</li>
                  <li className="flex items-center gap-2">✅ Programa de fidelidade</li>
                  <li className="flex items-center gap-2">✅ Multi-unidades</li>
                </ul>
                <a href="https://pay.cakto.com.br/qym84js_634453" target="_blank" rel="noopener noreferrer" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-bold">
                    💎 Upgrade Premium
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Card Pet Platinum Anual */}
            <Card className="border-2 border-green-500 shadow-xl relative hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg animate-pulse">
                🔥 25% OFF
              </div>
              <CardHeader className="text-center pt-8">
                <div className="text-4xl mb-2">💰</div>
                <CardTitle className="text-2xl">Pet Platinum Anual</CardTitle>
                <div className="text-xl line-through text-muted-foreground mt-2">R$ 1.798,80</div>
                <div className="text-4xl font-black text-green-600 dark:text-green-500">R$ 1.348,50<span className="text-lg font-normal">/ano</span></div>
                <div className="text-green-600 dark:text-green-500 font-semibold text-sm mt-2">25% de desconto</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">✅ Tudo do Platinum</li>
                  <li className="flex items-center gap-2">✅ Economia de R$ 450,30</li>
                  <li className="flex items-center gap-2">✅ Consultoria presencial</li>
                  <li className="flex items-center gap-2">✅ Treinamento gratuito</li>
                </ul>
                <a href="https://pay.cakto.com.br/3997ify_634474" target="_blank" rel="noopener noreferrer" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold">
                    💰 Garantir Melhor Preço
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
