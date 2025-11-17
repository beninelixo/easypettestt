import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AppModule, AppAction } from "./useEmployeePermissions";

export interface AccessAuditLog {
  id: string;
  user_id: string;
  pet_shop_id: string | null;
  module: AppModule;
  action: AppAction;
  resource_id: string | null;
  resource_type: string | null;
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

interface AuditFilters {
  userId?: string;
  petShopId?: string;
  module?: AppModule;
  action?: AppAction;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const useAccessAudit = () => {
  const [logs, setLogs] = useState<AccessAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const logAccess = async (
    petShopId: string,
    module: AppModule,
    action: AppAction,
    options?: {
      resourceId?: string;
      resourceType?: string;
      success?: boolean;
      metadata?: any;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('log_access', {
        _user_id: user.id,
        _pet_shop_id: petShopId,
        _module: module,
        _action: action,
        _resource_id: options?.resourceId || null,
        _resource_type: options?.resourceType || null,
        _success: options?.success !== undefined ? options.success : true,
        _metadata: options?.metadata || {},
      });

      if (error) {
        console.error("Error logging access:", error);
      }

      return data;
    } catch (error: any) {
      console.error("Error logging access:", error);
    }
  };

  const loadLogs = async (filters: AuditFilters = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from("access_audit")
        .select(`
          *
        `)
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.petShopId) {
        query = query.eq("pet_shop_id", filters.petShopId);
      }
      if (filters.module) {
        query = query.eq("module", filters.module);
      }
      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.success !== undefined) {
        query = query.eq("success", filters.success);
      }
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      // Limite padrão de 100 registros
      query = query.limit(filters.limit || 100);

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as any);
    } catch (error: any) {
      console.error("Error loading audit logs:", error);
      toast({
        title: "Erro ao carregar logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatsByModule = () => {
    const stats: Record<string, number> = {};
    logs.forEach(log => {
      const key = log.module;
      stats[key] = (stats[key] || 0) + 1;
    });
    return stats;
  };

  const getStatsByUser = () => {
    const stats: Record<string, { count: number; name: string }> = {};
    logs.forEach(log => {
      const key = log.user_id;
      if (!stats[key]) {
        stats[key] = {
          count: 0,
          name: log.profiles?.full_name || 'Usuário desconhecido',
        };
      }
      stats[key].count++;
    });
    return stats;
  };

  const getRecentActivity = (limit: number = 10) => {
    return logs.slice(0, limit);
  };

  return {
    logs,
    loading,
    logAccess,
    loadLogs,
    getStatsByModule,
    getStatsByUser,
    getRecentActivity,
  };
};
