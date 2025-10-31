import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trophy, Gift, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Fidelidade = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalPointsIssued: 0,
    activeMembers: 0,
  });

  useEffect(() => {
    if (user) {
      loadLoyaltyData();
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    const { data: petShop } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();

    if (petShop) {
      const { data, error } = await supabase
        .from("loyalty_points")
        .select(`
          *,
          profile:profiles!loyalty_points_client_id_fkey(full_name)
        `)
        .eq("pet_shop_id", petShop.id)
        .order("total_points_earned", { ascending: false });

      if (!error && data) {
        setLoyaltyData(data);
        setStats({
          totalClients: data.length,
          totalPointsIssued: data.reduce((sum, l) => sum + l.total_points_earned, 0),
          activeMembers: data.filter(l => l.points > 0).length,
        });
      }
    }
  };

  const getClientTier = (points: number) => {
    if (points >= 1000) return { name: "Diamante", color: "text-blue-500", icon: Trophy };
    if (points >= 500) return { name: "Ouro", color: "text-yellow-500", icon: Star };
    if (points >= 200) return { name: "Prata", color: "text-gray-400", icon: Gift };
    return { name: "Bronze", color: "text-orange-600", icon: Star };
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Programa de Fidelidade
        </h1>
        <p className="text-muted-foreground mt-1">Recompense seus clientes mais fiéis</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes Cadastrados</CardTitle>
            <Star className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">No programa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pontos Distribuídos</CardTitle>
            <Gift className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPointsIssued}</div>
            <p className="text-xs text-muted-foreground mt-1">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">Com pontos disponíveis</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Clientes</CardTitle>
          <CardDescription>Top clientes por pontos acumulados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loyaltyData.slice(0, 20).map((client, index) => {
              const tier = getClientTier(client.total_points_earned);
              const TierIcon = tier.icon;
              const progressToNextTier = client.total_points_earned >= 1000 
                ? 100 
                : (client.total_points_earned % (client.total_points_earned >= 500 ? 500 : 200)) / (client.total_points_earned >= 500 ? 5 : 2);

              return (
                <div key={client.id} className="p-4 border rounded-lg hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{client.profile?.full_name || "Cliente"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <TierIcon className={`h-4 w-4 ${tier.color}`} />
                          <span className={`text-sm font-medium ${tier.color}`}>{tier.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{client.points}</p>
                      <p className="text-xs text-muted-foreground">pontos disponíveis</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total acumulado</span>
                      <span className="font-medium">{client.total_points_earned} pts</span>
                    </div>
                    {client.total_points_earned < 1000 && (
                      <>
                        <Progress value={progressToNextTier} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          {client.total_points_earned >= 500 
                            ? `${1000 - client.total_points_earned} pts para Diamante`
                            : client.total_points_earned >= 200
                            ? `${500 - client.total_points_earned} pts para Ouro`
                            : `${200 - client.total_points_earned} pts para Prata`
                          }
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle>Como Funciona o Programa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">1</div>
            <div>
              <p className="font-semibold">Ganhe Pontos</p>
              <p className="text-sm text-muted-foreground">A cada R$ 1,00 gasto = 1 ponto acumulado</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold">2</div>
            <div>
              <p className="font-semibold">Suba de Nível</p>
              <p className="text-sm text-muted-foreground">Bronze → Prata (200pts) → Ouro (500pts) → Diamante (1000pts)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">3</div>
            <div>
              <p className="font-semibold">Troque por Recompensas</p>
              <p className="text-sm text-muted-foreground">Use pontos para descontos e serviços gratuitos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fidelidade;