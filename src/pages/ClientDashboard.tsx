import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Clock, Plus } from "lucide-react";

const ClientDashboard = () => {
  // Mock data - will be replaced with real data later
  const pets = [
    { id: 1, name: "Rex", breed: "Golden Retriever", age: 3 },
    { id: 2, name: "Luna", breed: "Poodle", age: 2 },
  ];

  const appointments = [
    {
      id: 1,
      petName: "Rex",
      service: "Banho e Tosa",
      date: "2025-02-15",
      time: "14:00",
      status: "Confirmado",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <PawPrint className="h-8 w-8 text-primary" />
              Meus Pets
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie seus pets e agendamentos</p>
          </div>
          <Button className="bg-primary hover:bg-primary-light">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Pets Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Meus Pets</h2>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Pet
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <Card key={pet.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-primary" />
                    {pet.name}
                  </CardTitle>
                  <CardDescription>
                    {pet.breed} • {pet.age} anos
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
        </section>

        {/* Appointments Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Próximos Agendamentos</h2>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{appointment.service}</h3>
                      <p className="text-sm text-muted-foreground">Pet: {appointment.petName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(appointment.date).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                      {appointment.status}
                    </span>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClientDashboard;
