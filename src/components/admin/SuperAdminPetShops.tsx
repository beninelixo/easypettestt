import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Building2, Eye, Edit, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PetShop {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  subscription_plan: string;
  subscription_expires_at: string;
  created_at: string;
}

export const SuperAdminPetShops = () => {
  const [petShops, setPetShops] = useState<PetShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPetShops();
  }, []);

  const loadPetShops = async () => {
    try {
      const { data, error } = await supabase
        .from("pet_shops")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPetShops(data || []);
    } catch (error: any) {
      console.error("Error loading pet shops:", error);
      toast({
        title: "Erro ao carregar estabelecimentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (petShopId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from("pet_shops")
        .update({ subscription_plan: newPlan })
        .eq("id", petShopId);

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: "O plano foi atualizado com sucesso.",
      });

      loadPetShops();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPetShops = petShops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, any> = {
      'pet_gold': 'secondary',
      'pet_platinum': 'default',
      'pet_platinum_anual': 'default',
      'free': 'outline',
    };
    return <Badge variant={variants[plan] || 'outline'}>{plan}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Pet Shops</CardTitle>
        <CardDescription>
          Visualize e gerencie todos os estabelecimentos cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>Cadastrado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPetShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shop.name}</div>
                      <div className="text-sm text-muted-foreground">{shop.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {shop.city && shop.state ? `${shop.city}, ${shop.state}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={shop.subscription_plan || 'free'}
                      onValueChange={(value) => updatePlan(shop.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pet_gold">Pet Gold</SelectItem>
                        <SelectItem value="pet_platinum">Pet Platinum</SelectItem>
                        <SelectItem value="pet_platinum_anual">Pet Platinum Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {shop.subscription_expires_at
                      ? new Date(shop.subscription_expires_at).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(shop.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && filteredPetShops.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum estabelecimento encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
