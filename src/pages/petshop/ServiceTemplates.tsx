import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Check, ArrowLeft } from "lucide-react";
import { serviceTemplates, serviceCategories, ServiceTemplate } from "@/data/serviceTemplates";
import { useNavigate } from "react-router-dom";

const ServiceTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addedServices, setAddedServices] = useState<Set<string>>(new Set());

  const filteredServices = serviceTemplates.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddService = async (template: ServiceTemplate) => {
    if (!user) return;

    try {
      // Get pet shop id
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!petShop) {
        toast({
          title: "Erro",
          description: "Pet shop não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Check if service already exists
      const { data: existingService } = await supabase
        .from("services")
        .select("id")
        .eq("pet_shop_id", petShop.id)
        .eq("name", template.name)
        .single();

      if (existingService) {
        toast({
          title: "Serviço já existe",
          description: "Este serviço já está cadastrado no seu pet shop",
          variant: "destructive",
        });
        return;
      }

      // Add service
      const { error } = await supabase
        .from("services")
        .insert({
          name: template.name,
          description: template.description,
          price: template.price,
          duration_minutes: template.duration_minutes,
          active: true,
          pet_shop_id: petShop.id,
        });

      if (error) throw error;

      setAddedServices(prev => new Set(prev).add(template.id));
      
      toast({
        title: "✅ Serviço adicionado!",
        description: `${template.name} foi adicionado ao seu catálogo`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar serviço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/petshop-dashboard/servicos")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">📚 Catálogo de Serviços</h1>
          <p className="text-muted-foreground mt-2">
            61 serviços profissionais prontos para adicionar ao seu pet shop
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos ({serviceTemplates.length})
            </Button>
            {serviceCategories.map((category) => {
              const count = serviceTemplates.filter(s => s.category === category.id).length;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const isAdded = addedServices.has(service.id);
          const category = serviceCategories.find(c => c.id === service.category);
          
          return (
            <Card key={service.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{service.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {category?.name}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Preço sugerido:</span>
                    <p className="font-semibold text-lg">R$ {service.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Duração:</span>
                    <p className="font-semibold">{service.duration_minutes} min</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleAddService(service)}
                  disabled={isAdded}
                  className="w-full"
                  variant={isAdded ? "secondary" : "default"}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Adicionado
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar ao Catálogo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar sua busca ou filtros
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceTemplates;
