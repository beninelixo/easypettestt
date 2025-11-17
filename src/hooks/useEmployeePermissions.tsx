import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AppModule = 
  | 'dashboard'
  | 'appointments'
  | 'clients'
  | 'pets'
  | 'services'
  | 'products'
  | 'inventory'
  | 'financial'
  | 'reports'
  | 'marketing'
  | 'settings'
  | 'employees';

export type AppAction = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export interface Permission {
  id: string;
  module: AppModule;
  action: AppAction;
  name: string;
  description: string | null;
}

export interface EmployeePermission {
  id: string;
  employee_id: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
  permission: Permission;
}

export interface EmployeeWithPermissions {
  id: string;
  user_id: string;
  position: string;
  hired_at: string;
  active: boolean;
  profiles: {
    full_name: string;
    email?: string;
    phone?: string;
  };
  permissions: Permission[];
}

export const useEmployeePermissions = (petShopId?: string) => {
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailablePermissions();
  }, []);

  const loadAvailablePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("module", { ascending: true })
        .order("action", { ascending: true });

      if (error) throw error;
      setAvailablePermissions(data || []);
    } catch (error: any) {
      console.error("Error loading permissions:", error);
      toast({
        title: "Erro ao carregar permissões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeePermissions = async (employeeId: string): Promise<Permission[]> => {
    try {
      const { data, error } = await supabase
        .from("employee_permissions")
        .select(`
          permission_id,
          permissions:permission_id (
            id,
            module,
            action,
            name,
            description
          )
        `)
        .eq("employee_id", employeeId);

      if (error) throw error;
      
      return (data || []).map((ep: any) => ep.permissions).filter(Boolean);
    } catch (error: any) {
      console.error("Error loading employee permissions:", error);
      return [];
    }
  };

  const grantPermission = async (employeeId: string, permissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("employee_permissions")
        .insert({
          employee_id: employeeId,
          permission_id: permissionId,
          granted_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Permissão concedida",
        description: "A permissão foi adicionada com sucesso.",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error granting permission:", error);
      toast({
        title: "Erro ao conceder permissão",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const revokePermission = async (employeeId: string, permissionId: string) => {
    try {
      const { error } = await supabase
        .from("employee_permissions")
        .delete()
        .eq("employee_id", employeeId)
        .eq("permission_id", permissionId);

      if (error) throw error;

      toast({
        title: "Permissão revogada",
        description: "A permissão foi removida com sucesso.",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error revoking permission:", error);
      toast({
        title: "Erro ao revogar permissão",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const setEmployeePermissions = async (
    employeeId: string, 
    permissionIds: string[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Remove todas as permissões existentes
      const { error: deleteError } = await supabase
        .from("employee_permissions")
        .delete()
        .eq("employee_id", employeeId);

      if (deleteError) throw deleteError;

      // Adiciona as novas permissões
      if (permissionIds.length > 0) {
        const { error: insertError } = await supabase
          .from("employee_permissions")
          .insert(
            permissionIds.map(permissionId => ({
              employee_id: employeeId,
              permission_id: permissionId,
              granted_by: user.id,
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: "Permissões atualizadas",
        description: "As permissões do funcionário foram atualizadas com sucesso.",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error setting employee permissions:", error);
      toast({
        title: "Erro ao atualizar permissões",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const getPermissionsByModule = (module: AppModule) => {
    return availablePermissions.filter(p => p.module === module);
  };

  const groupPermissionsByModule = () => {
    const grouped: Record<AppModule, Permission[]> = {} as any;
    
    availablePermissions.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = [];
      }
      grouped[permission.module].push(permission);
    });

    return grouped;
  };

  return {
    availablePermissions,
    loading,
    loadEmployeePermissions,
    grantPermission,
    revokePermission,
    setEmployeePermissions,
    getPermissionsByModule,
    groupPermissionsByModule,
    refresh: loadAvailablePermissions,
  };
};
