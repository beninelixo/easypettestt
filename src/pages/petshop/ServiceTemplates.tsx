import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ServiceTemplate {
  id: string;
  category: string;
  name: string;
  description: string | null;
  suggested_duration_minutes: number;
  suggested_price_min: number | null;
  suggested_price_max: number | null;
  icon: string | null;
}

const ServiceTemplates = () => {
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("banho_tosa");
  const [loading, setLoading] = useState(false);
  const [addedServices, setAddedServices] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("service_templates")
      .select("*")
      .eq("active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (!error && data) {
      setTemplates(data);
    }
  };

  const addServiceFromTemplate = async (template: ServiceTemplate) => {
    setLoading(true);
    try {
      // Get pet shop ID
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!petShop) {
        toast({
          title: "Erro",
          description: "Pet shop não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Calculate average price
      const avgPrice =
        template.suggested_price_min && template.suggested_price_max
          ? (template.suggested_price_min + template.suggested_price_max) / 2
          : template.suggested_price_min || 0;

      // Create service
      const { error } = await supabase.from("services").insert({
        pet_shop_id: petShop.id,
        name: template.name,
        description: template.description,
        duration_minutes: template.suggested_duration_minutes,
        price: avgPrice,
        active: true,
      });

      if (error) throw error;

      setAddedServices((prev) => new Set(prev).add(template.id));

      toast({
        title: "Serviço adicionado!",
        description: `${template.name} foi adicionado aos seus serviços`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar serviço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates
    .filter((t) => t.category === activeCategory)
    .filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const groupedByCategory = {
    banho_tosa: templates.filter((t) => t.category === "banho_tosa"),
    clinica: templates.filter((t) => t.category === "clinica"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catálogo de Serviços</h1>
        <p className="text-muted-foreground mt-2">
          Adicione serviços profissionais ao seu pet shop com um clique
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="banho_tosa">
            Banho e Tosa ({groupedByCategory.banho_tosa.length})
          </TabsTrigger>
          <TabsTrigger value="clinica">
            Clínica ({groupedByCategory.clinica.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banho_tosa" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {template.icon && <span className="text-2xl">{template.icon}</span>}
                        <Badge variant="outline" className="text-xs">
                          {template.suggested_duration_minutes} min
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">Preço sugerido:</span>
                    <span className="text-lg font-bold text-primary">
                      R$ {template.suggested_price_min?.toFixed(2)}
                      {template.suggested_price_max && ` - R$ ${template.suggested_price_max?.toFixed(2)}`}
                    </span>
                  </div>
                  <Button
                    onClick={() => addServiceFromTemplate(template)}
                    disabled={loading || addedServices.has(template.id)}
                    className="w-full"
                    variant={addedServices.has(template.id) ? "outline" : "default"}
                  >
                    {addedServices.has(template.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Adicionado
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Serviço
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clinica" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {template.icon && <span className="text-2xl">{template.icon}</span>}
                        <Badge variant="outline" className="text-xs">
                          {template.suggested_duration_minutes} min
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">Preço sugerido:</span>
                    <span className="text-lg font-bold text-primary">
                      R$ {template.suggested_price_min?.toFixed(2)}
                      {template.suggested_price_max && ` - R$ ${template.suggested_price_max?.toFixed(2)}`}
                    </span>
                  </div>
                  <Button
                    onClick={() => addServiceFromTemplate(template)}
                    disabled={loading || addedServices.has(template.id)}
                    className="w-full"
                    variant={addedServices.has(template.id) ? "outline" : "default"}
                  >
                    {addedServices.has(template.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Adicionado
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Serviço
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceTemplates;
