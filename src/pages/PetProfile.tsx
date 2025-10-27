import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, PawPrint } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PetProfile = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [pet, setPet] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
    observations: "",
    allergies: "",
  });

  useEffect(() => {
    if (petId && petId !== "new") {
      loadPet();
    }
  }, [petId]);

  const loadPet = async () => {
    if (!petId || !user) return;
    
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .eq("owner_id", user.id)
      .single();

    if (!error && data) {
      setPet({
        name: data.name,
        breed: data.breed || "",
        age: data.age?.toString() || "",
        weight: data.weight?.toString() || "",
        observations: data.observations || "",
        allergies: data.allergies || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);

    const petData = {
      owner_id: user.id,
      name: pet.name,
      breed: pet.breed || null,
      age: pet.age ? parseInt(pet.age) : null,
      weight: pet.weight ? parseFloat(pet.weight) : null,
      observations: pet.observations || null,
      allergies: pet.allergies || null,
    };

    let error;
    if (petId && petId !== "new") {
      const result = await supabase
        .from("pets")
        .update(petData)
        .eq("id", petId)
        .eq("owner_id", user.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("pets")
        .insert(petData);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao salvar pet",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: petId === "new" ? "Pet cadastrado!" : "Pet atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
      navigate("/client-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/client-dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            {petId === "new" ? "Cadastrar Pet" : "Editar Pet"}
          </h1>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={pet.name}
                  onChange={(e) => setPet({ ...pet, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Raça</Label>
                  <Input
                    id="breed"
                    value={pet.breed}
                    onChange={(e) => setPet({ ...pet, breed: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Idade (anos)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    value={pet.age}
                    onChange={(e) => setPet({ ...pet, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={pet.weight}
                  onChange={(e) => setPet({ ...pet, weight: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  value={pet.allergies}
                  onChange={(e) => setPet({ ...pet, allergies: e.target.value })}
                  placeholder="Liste quaisquer alergias conhecidas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={pet.observations}
                  onChange={(e) => setPet({ ...pet, observations: e.target.value })}
                  placeholder="Comportamento, preferências, ou outras informações importantes"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Pet"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PetProfile;
