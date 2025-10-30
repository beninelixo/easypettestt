import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Store, Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface PetShop {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  code: string;
}

export default function ClientSelectPetShop() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [petShops, setPetShops] = useState<PetShop[]>([]);
  const [filteredPetShops, setFilteredPetShops] = useState<PetShop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPetShops();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = petShops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPetShops(filtered);
    } else {
      setFilteredPetShops(petShops);
    }
  }, [searchTerm, petShops]);

  const loadPetShops = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_shops')
        .select('*')
        .order('name');

      if (error) throw error;
      setPetShops(data || []);
      setFilteredPetShops(data || []);
    } catch (error: any) {
      console.error('Error loading pet shops:', error);
      toast({
        title: "Erro ao carregar pet shops",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPetShop = (petShopId: string) => {
    localStorage.setItem('selected_pet_shop_id', petShopId);
    navigate('/new-appointment');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Escolha um Pet Shop</h1>
            <p className="text-muted-foreground">
              Selecione o estabelecimento onde deseja agendar
            </p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Buscar por nome, cidade ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando pet shops...</p>
            </div>
          ) : filteredPetShops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Nenhum pet shop encontrado com esses critérios"
                    : "Nenhum pet shop disponível no momento"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPetShops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{shop.name}</CardTitle>
                        <CardDescription className="text-sm font-mono">
                          Código: {shop.code}
                        </CardDescription>
                      </div>
                      <Store className="w-8 h-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {shop.city && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{shop.city}</span>
                      </div>
                    )}
                    
                    {shop.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{shop.address}</span>
                      </div>
                    )}
                    
                    {shop.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleSelectPetShop(shop.id)}
                      className="w-full mt-4"
                    >
                      Selecionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}