import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Check, ArrowLeft, Star, Clock, DollarSign, Eye } from "lucide-react";
import { serviceTemplates, serviceCategories, ServiceTemplate } from "@/data/serviceTemplates";
import { useNavigate } from "react-router-dom";

const ServiceTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addedServices, setAddedServices] = useState<Set<string>>(new Set());
  const [previewService, setPreviewService] = useState<ServiceTemplate | null>(null);

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

                <div className="flex gap-2">
                  <Button
                    onClick={() => setPreviewService(service)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => handleAddService(service)}
                    disabled={isAdded}
                    className="flex-1"
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
                        Adicionar
                      </>
                    )}
                  </Button>
                </div>
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

      {/* Preview Modal */}
      <Dialog open={!!previewService} onOpenChange={() => setPreviewService(null)}>
        <DialogContent className="max-w-2xl">
          {previewService && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <span className="text-4xl">{previewService.icon}</span>
                  {previewService.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Category Badge */}
                <div>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {serviceCategories.find(c => c.id === previewService.category)?.name}
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">📝 Descrição Completa</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {previewService.description}
                  </p>
                </div>

                {/* Pricing and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Preço Sugerido</span>
                      </div>
                      <p className="text-3xl font-bold text-primary">
                        R$ {previewService.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Você pode personalizar ao adicionar
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Duração Estimada</span>
                      </div>
                      <p className="text-3xl font-bold text-primary">
                        {previewService.duration_minutes}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">minutos</p>
                    </CardContent>
                  </Card>
                </div>

                {/* User Reviews */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Avaliações de Profissionais
                  </h3>
                  <div className="space-y-3">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">Pet Shop Central</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Serviço muito procurado pelos clientes. Excelente retorno financeiro!"
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">Clínica Vet Plus</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Fácil de realizar e os clientes adoram. Recomendo adicionar!"
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewService(null)}
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      handleAddService(previewService);
                      setPreviewService(null);
                    }}
                    disabled={addedServices.has(previewService.id)}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600"
                  >
                    {addedServices.has(previewService.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Já Adicionado
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar ao Catálogo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceTemplates;
