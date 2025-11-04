import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const ProfessionalReports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análises e Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Acompanhe o desempenho do seu negócio
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalReports;
