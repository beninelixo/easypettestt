import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AppModule, AppAction } from "./useEmployeePermissions";

/**
 * Hook para verificar se o usuário atual tem uma permissão específica
 * 
 * @param petShopId - ID do pet shop
 * @param module - Módulo do sistema (ex: 'appointments', 'financial')
 * @param action - Ação desejada (ex: 'view', 'create', 'edit', 'delete', 'manage')
 * @returns {boolean} - true se o usuário tem a permissão, false caso contrário
 */
export const usePermission = (
  petShopId: string | undefined,
  module: AppModule,
  action: AppAction
) => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, [user, petShopId, module, action]);

  const checkPermission = async () => {
    if (!user || !petShopId) {
      setHasPermission(false);
      setLoading(false);
      return;
    }

    try {
      // Chama a função do banco de dados para verificar permissão
      const { data, error } = await supabase.rpc('has_permission', {
        _user_id: user.id,
        _pet_shop_id: petShopId,
        _module: module,
        _action: action,
      });

      if (error) {
        console.error("Error checking permission:", error);
        setHasPermission(false);
      } else {
        setHasPermission(data === true);
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  return { hasPermission, loading, recheck: checkPermission };
};

/**
 * Hook para verificar múltiplas permissões de uma vez
 * 
 * @param petShopId - ID do pet shop
 * @param permissions - Array de objetos {module, action}
 * @returns Record com as permissões checadas
 */
export const usePermissions = (
  petShopId: string | undefined,
  permissions: Array<{ module: AppModule; action: AppAction; key?: string }>
) => {
  const { user } = useAuth();
  const [permissionsMap, setPermissionsMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [user, petShopId, permissions]);

  const checkPermissions = async () => {
    if (!user || !petShopId || permissions.length === 0) {
      setPermissionsMap({});
      setLoading(false);
      return;
    }

    try {
      const results: Record<string, boolean> = {};

      // Verifica todas as permissões em paralelo
      await Promise.all(
        permissions.map(async ({ module, action, key }) => {
          const permKey = key || `${module}_${action}`;
          
          try {
            const { data, error } = await supabase.rpc('has_permission', {
              _user_id: user.id,
              _pet_shop_id: petShopId,
              _module: module,
              _action: action,
            });

            results[permKey] = error ? false : (data === true);
          } catch (error) {
            results[permKey] = false;
          }
        })
      );

      setPermissionsMap(results);
    } catch (error) {
      console.error("Error checking permissions:", error);
      setPermissionsMap({});
    } finally {
      setLoading(false);
    }
  };

  return { permissions: permissionsMap, loading, recheck: checkPermissions };
};

/**
 * Hook para obter todas as permissões do usuário atual
 * 
 * @param petShopId - ID do pet shop
 * @returns Lista de permissões do usuário
 */
export const useUserPermissions = (petShopId: string | undefined) => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPermissions();
  }, [user, petShopId]);

  const loadUserPermissions = async () => {
    if (!user || !petShopId) {
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_employee_permissions', {
        _user_id: user.id,
        _pet_shop_id: petShopId,
      });

      if (error) {
        console.error("Error loading user permissions:", error);
        setUserPermissions([]);
      } else {
        setUserPermissions(data || []);
      }
    } catch (error) {
      console.error("Error loading user permissions:", error);
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const can = (module: AppModule, action: AppAction) => {
    return userPermissions.some(
      p => p.module === module && p.action === action
    );
  };

  const canAny = (...checks: Array<{ module: AppModule; action: AppAction }>) => {
    return checks.some(({ module, action }) => can(module, action));
  };

  const canAll = (...checks: Array<{ module: AppModule; action: AppAction }>) => {
    return checks.every(({ module, action }) => can(module, action));
  };

  return {
    permissions: userPermissions,
    loading,
    can,
    canAny,
    canAll,
    refresh: loadUserPermissions,
  };
};
