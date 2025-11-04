import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const ProfessionalCalendar = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendário</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Visualize e gerencie seus agendamentos aqui
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalCalendar;
