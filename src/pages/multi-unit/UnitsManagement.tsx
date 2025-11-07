import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMultiUnit } from "@/shared/hooks/useMultiUnit";
import { useTenant } from "@/lib/tenant-context";
import { Building2, Plus, Search, Settings, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UnitsManagement() {
  const { franchises } = useMultiUnit();
  const { tenantId, can } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFranchise, setSelectedFranchise] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredUnits = franchises
    .filter(f => selectedFranchise === "all" || f.id === selectedFranchise)
    .flatMap(f => (f.units || []).map(u => ({ ...u, franchiseName: f.name })))
    .filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (!can('manage_units')) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Você não tem permissão para gerenciar unidades.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Gestão de Unidades
            </h1>
            <p className="text-muted-foreground">
              Gerencie todas as unidades e franquias da rede
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Unidade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Unidade</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova unidade para sua franquia
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="franchise">Franquia</Label>
                  <Select>
                    <SelectTrigger id="franchise">
                      <SelectValue placeholder="Selecione a franquia" />
                    </SelectTrigger>
                    <SelectContent>
                      {franchises.map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Unidade</Label>
                  <Input id="name" placeholder="Ex: PetShop Centro" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" placeholder="Rua, número, bairro" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="São Paulo" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(11) 99999-9999" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Cadastrar Unidade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar unidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedFranchise} onValueChange={setSelectedFranchise}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as franquias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as franquias</SelectItem>
                  {franchises.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {filteredUnits.length} unidades encontradas
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grade</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUnits.map((unit) => (
              <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{unit.name}</CardTitle>
                        <CardDescription>{unit.code}</CardDescription>
                      </div>
                    </div>
                    {unit.alerts && unit.alerts > 0 && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {unit.alerts}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{unit.franchiseName}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{Math.floor(Math.random() * 100 + 50)} clientes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>+{Math.floor(Math.random() * 30)}%</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        {unit.city || "Cidade não informada"}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                      <Button size="sm" className="flex-1">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Franquia</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clientes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{unit.name}</p>
                            <p className="text-sm text-muted-foreground">{unit.code}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{unit.franchiseName}</TableCell>
                      <TableCell>{unit.city || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="default">Ativa</Badge>
                      </TableCell>
                      <TableCell>{Math.floor(Math.random() * 100 + 50)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[500px] flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Visualização de mapa em desenvolvimento...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
