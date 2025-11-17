import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, Save, RefreshCw } from "lucide-react";
import { useEmployeePermissions, type Permission, type AppModule } from "@/hooks/useEmployeePermissions";

interface EmployeePermissionsManagerProps {
  employeeId: string;
  employeeName: string;
  onSave?: () => void;
}

const moduleLabels: Record<AppModule, string> = {
  dashboard: "📊 Dashboard",
  appointments: "📅 Agendamentos",
  clients: "👥 Clientes",
  pets: "🐾 Pets",
  services: "✨ Serviços",
  products: "📦 Produtos",
  inventory: "📈 Estoque",
  financial: "💰 Financeiro",
  reports: "📑 Relatórios",
  marketing: "📢 Marketing",
  settings: "⚙️ Configurações",
  employees: "👔 Funcionários",
};

const actionLabels = {
  view: "Visualizar",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
  manage: "Gerenciar",
};

export const EmployeePermissionsManager = ({
  employeeId,
  employeeName,
  onSave,
}: EmployeePermissionsManagerProps) => {
  const {
    availablePermissions,
    loading,
    loadEmployeePermissions,
    setEmployeePermissions,
    groupPermissionsByModule,
  } = useEmployeePermissions();

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  useEffect(() => {
    loadCurrentPermissions();
  }, [employeeId]);

  const loadCurrentPermissions = async () => {
    setLoadingCurrent(true);
    const permissions = await loadEmployeePermissions(employeeId);
    setSelectedPermissions(new Set(permissions.map(p => p.id)));
    setLoadingCurrent(false);
  };

  const handleTogglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSelectAll = (module: AppModule) => {
    const modulePermissions = availablePermissions.filter(p => p.module === module);
    const newSelected = new Set(selectedPermissions);
    
    const allSelected = modulePermissions.every(p => newSelected.has(p.id));
    
    if (allSelected) {
      // Desmarcar todos do módulo
      modulePermissions.forEach(p => newSelected.delete(p.id));
    } else {
      // Marcar todos do módulo
      modulePermissions.forEach(p => newSelected.add(p.id));
    }
    
    setSelectedPermissions(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await setEmployeePermissions(employeeId, Array.from(selectedPermissions));
    setSaving(false);
    
    if (result.success && onSave) {
      onSave();
    }
  };

  const groupedPermissions = groupPermissionsByModule();
  const moduleKeys = Object.keys(groupedPermissions) as AppModule[];

  const getSelectedCount = (module: AppModule) => {
    const modulePermissions = groupedPermissions[module] || [];
    return modulePermissions.filter(p => selectedPermissions.has(p.id)).length;
  };

  if (loading || loadingCurrent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Carregando permissões...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciar Permissões: {employeeName}
        </CardTitle>
        <CardDescription>
          Selecione as permissões que este funcionário terá no sistema.
          Total: {selectedPermissions.size} de {availablePermissions.length} permissões
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {moduleKeys.map((module) => {
              const permissions = groupedPermissions[module] || [];
              const selectedCount = getSelectedCount(module);
              const totalCount = permissions.length;
              const allSelected = selectedCount === totalCount && totalCount > 0;

              return (
                <div key={module} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">
                        {moduleLabels[module]}
                      </h3>
                      <Badge variant={selectedCount > 0 ? "default" : "secondary"}>
                        {selectedCount}/{totalCount}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(module)}
                    >
                      {allSelected ? "Desmarcar" : "Selecionar"} Todos
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.has(permission.id)}
                          onCheckedChange={() => handleTogglePermission(permission.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={permission.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {actionLabels[permission.action]} • {permission.name}
                          </Label>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Permissões
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={loadCurrentPermissions}
            disabled={saving || loadingCurrent}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
