import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PawPrint, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ClientPets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPets();
    }
  }, [user]);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", user?.id);

      if (!error && data) {
        setPets(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meus Pets</h1>
        <Button onClick={() => navigate("/client/pets/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Pet
        </Button>
      </div>

      {pets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <PawPrint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhum pet</p>
            <Button onClick={() => navigate("/client/pets/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <Card 
              key={pet.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/client/pets/${pet.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-primary" />
                  {pet.name}
                </CardTitle>
                <CardDescription>
                  {pet.breed && `${pet.breed}`}
                  {pet.age && ` • ${pet.age} anos`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" className="w-full">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientPets;
