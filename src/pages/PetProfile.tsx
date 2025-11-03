import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, PawPrint } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schema for pet data
const petSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  breed: z.string()
    .trim()
    .max(50, "Raça deve ter no máximo 50 caracteres")
    .nullable()
    .optional(),
  age: z.number()
    .int("Idade deve ser um número inteiro")
    .min(0, "Idade não pode ser negativa")
    .max(50, "Idade máxima é 50 anos")
    .nullable()
    .optional(),
  weight: z.number()
    .min(0.1, "Peso deve ser maior que 0")
    .max(500, "Peso máximo é 500 kg")
    .nullable()
    .optional(),
  allergies: z.string()
    .max(500, "Alergias deve ter no máximo 500 caracteres")
    .nullable()
    .optional(),
  observations: z.string()
    .max(1000, "Observações deve ter no máximo 1000 caracteres")
    .nullable()
    .optional(),
});

const PetProfile = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loadingPet, setLoadingPet] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
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
      loadPetHistory();
    }
  }, [petId]);

  const loadPet = async () => {
    if (!petId || !user) return;
    
    setLoadingPet(true);
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
    setLoadingPet(false);
  };

  const loadPetHistory = async () => {
    if (!petId || !user) return;
    
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        service:services(name, price)
      `)
      .eq("pet_id", petId)
      .eq("client_id", user.id)
      .order("scheduled_date", { ascending: false })
      .limit(5);

    if (!error && data) {
      setAppointments(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);

    try {
      // Validate input data
      const validatedData = petSchema.parse({
        name: pet.name,
        breed: pet.breed || null,
        age: pet.age ? parseInt(pet.age) : null,
        weight: pet.weight ? parseFloat(pet.weight) : null,
        observations: pet.observations || null,
        allergies: pet.allergies || null,
      });

      const petData = {
        owner_id: user.id,
        ...validatedData,
      };

      let error;
      if (petId && petId !== "new") {
        const result = await supabase
          .from("pets")
          .update({
            name: validatedData.name,
            breed: validatedData.breed,
            age: validatedData.age,
            weight: validatedData.weight,
            observations: validatedData.observations,
            allergies: validatedData.allergies,
          })
          .eq("id", petId)
          .eq("owner_id", user.id);
        error = result.error;
      } else {
        const result = await supabase
          .from("pets")
          .insert({
            owner_id: user.id,
            name: validatedData.name,
            breed: validatedData.breed,
            age: validatedData.age,
            weight: validatedData.weight,
            observations: validatedData.observations,
            allergies: validatedData.allergies,
          });
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: petId === "new" ? "Pet cadastrado!" : "Pet atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
      navigate("/client-dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar pet",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
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

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid gap-6">
          {/* Pet Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-primary" />
                {petId === "new" ? "Cadastrar Novo Pet" : "Informações do Pet"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPet ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Carregando informações...</p>
                </div>
              ) : (
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

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Salvando..." : petId === "new" ? "Cadastrar Pet" : "Salvar Alterações"}
                    </Button>
                    {petId !== "new" && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigate("/new-appointment")}
                      >
                        Agendar Serviço
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Pet History Card */}
          {petId !== "new" && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Nenhum serviço realizado ainda</p>
                    <Button onClick={() => navigate("/new-appointment")}>
                      Agendar Primeiro Serviço
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{appointment.service?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.scheduled_date).toLocaleDateString('pt-BR')} às {appointment.scheduled_time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">
                            R$ {Number(appointment.service?.price || 0).toFixed(2)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === "completed" ? "bg-primary/10 text-primary" :
                            appointment.status === "confirmed" ? "bg-accent/10 text-accent" :
                            appointment.status === "pending" ? "bg-secondary/10 text-secondary" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {appointment.status === "completed" ? "Concluído" :
                             appointment.status === "confirmed" ? "Confirmado" :
                             appointment.status === "pending" ? "Pendente" :
                             "Cancelado"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
