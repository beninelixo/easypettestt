import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Store } from "lucide-react";

const ProfessionalProfile = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Perfil</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Dados do PetShop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gerencie as informações do seu estabelecimento
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalProfile;
