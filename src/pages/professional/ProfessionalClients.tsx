import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const ProfessionalClients = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Visualize e gerencie seus clientes aqui
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalClients;
