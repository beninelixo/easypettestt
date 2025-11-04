import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const ClientSchedule = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agendar Serviço</h1>

      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Selecione um PetShop</h3>
          <p className="text-muted-foreground mb-6">
            Escolha o petshop onde deseja realizar o serviço
          </p>
          <Button onClick={() => navigate("/select-petshop")}>
            Ver PetShops Disponíveis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSchedule;
