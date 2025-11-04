import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors } from "lucide-react";

const ProfessionalServices = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Serviços</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Gerenciar Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pelo seu petshop
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalServices;
