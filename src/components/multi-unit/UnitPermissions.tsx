import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Edit, Trash2, Users, Settings } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const permissions: Permission[] = [
  // Visualização
  {
    id: "view_dashboard",
    name: "Ver Dashboard",
    description: "Acesso ao dashboard da unidade",
    icon: <Eye className="h-4 w-4" />,
    category: "Visualização",
  },
  {
    id: "view_reports",
    name: "Ver Relatórios",
    description: "Acesso aos relatórios financeiros e operacionais",
    icon: <Eye className="h-4 w-4" />,
    category: "Visualização",
  },
  
  // Gestão
  {
    id: "manage_appointments",
    name: "Gerenciar Agendamentos",
    description: "Criar, editar e cancelar agendamentos",
    icon: <Edit className="h-4 w-4" />,
    category: "Gestão",
  },
  {
    id: "manage_clients",
    name: "Gerenciar Clientes",
    description: "Adicionar, editar e remover clientes",
    icon: <Users className="h-4 w-4" />,
    category: "Gestão",
  },
  {
    id: "manage_services",
    name: "Gerenciar Serviços",
    description: "Configurar serviços e preços",
    icon: <Settings className="h-4 w-4" />,
    category: "Gestão",
  },
  
  // Administração
  {
    id: "manage_employees",
    name: "Gerenciar Funcionários",
    description: "Adicionar, editar e remover funcionários",
    icon: <Users className="h-4 w-4" />,
    category: "Administração",
  },
  {
    id: "manage_units",
    name: "Gerenciar Unidades",
    description: "Configurar e administrar unidades",
    icon: <Shield className="h-4 w-4" />,
    category: "Administração",
  },
  {
    id: "delete_records",
    name: "Excluir Registros",
    description: "Permissão para excluir dados permanentemente",
    icon: <Trash2 className="h-4 w-4 text-destructive" />,
    category: "Administração",
  },
];

interface UnitPermissionsProps {
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string, checked: boolean) => void;
  role?: string;
}

export function UnitPermissions({ 
  selectedPermissions, 
  onPermissionChange,
  role 
}: UnitPermissionsProps) {
  const categories = Array.from(new Set(permissions.map(p => p.category)));

  const isPermissionDisabled = (permissionId: string) => {
    // Admin sempre tem todas as permissões
    if (role === "admin" || role === "tenant_admin") return true;
    
    // Outras lógicas de bloqueio podem ser adicionadas aqui
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Permissões por Unidade</CardTitle>
        </div>
        <CardDescription>
          Configure as permissões de acesso para esta unidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {role === "admin" || role === "tenant_admin" ? (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Acesso Total Garantido</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Como administrador, você tem acesso a todas as funcionalidades automaticamente.
            </p>
          </div>
        ) : null}

        {categories.map((category) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">{category}</Badge>
              <Separator className="flex-1" />
            </div>
            
            <div className="space-y-3">
              {permissions
                .filter(p => p.category === category)
                .map((permission) => {
                  const disabled = isPermissionDisabled(permission.id);
                  const checked = disabled || selectedPermissions.includes(permission.id);
                  
                  return (
                    <div
                      key={permission.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                        checked ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        id={permission.id}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(checked) => 
                          onPermissionChange(permission.id, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={permission.id}
                          className="flex items-center gap-2 cursor-pointer font-medium"
                        >
                          {permission.icon}
                          {permission.name}
                          {disabled && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        <Separator />
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedPermissions.length} de {permissions.length} permissões selecionadas
          </span>
          <Badge variant="secondary">
            {Math.round((selectedPermissions.length / permissions.length) * 100)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
