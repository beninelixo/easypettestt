import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Store, Search, LogIn } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        loadPetShops();
      } else {
        setLoading(false);
      }
    };
    checkAuth();
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
        .select('id, name, address, city, phone, code')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setPetShops(data || []);
      setFilteredPetShops(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar pet shops",
        description: "Não foi possível carregar a lista de pet shops. Tente novamente.",
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

          {/* Show login prompt if not authenticated */}
          {isAuthenticated === false && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="py-8 text-center">
                <LogIn className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Faça login para continuar</h3>
                <p className="text-muted-foreground mb-4">
                  Para ver e selecionar pet shops, você precisa estar logado.
                </p>
                <Button onClick={() => navigate('/auth')} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Fazer Login
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Show content only when authenticated */}
          {isAuthenticated && (
            <>
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
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
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
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}