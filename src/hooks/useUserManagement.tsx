import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "client" | "pet_shop" | "admin" | "super_admin";

export interface PetShopInfo {
  id: string;
  name: string;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
}

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role: UserRole | null;
  created_at: string;
  last_sign_in_at: string | null;
  phone?: string;
  avatar_url?: string;
  is_blocked: boolean;
  pet_shop: PetShopInfo | null;
}

export interface AdminInvite {
  id: string;
  email: string;
  invited_by: string;
  expires_at: string;
  accepted: boolean;
  created_at: string;
}

export interface RoleChangeAudit {
  id: string;
  changed_user_id: string;
  changed_by: string;
  old_role: UserRole | null;
  new_role: UserRole;
  action: string;
  created_at: string;
  metadata: any;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [roleChanges, setRoleChanges] = useState<RoleChangeAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const fetchUsers = async (search?: string) => {
    try {
      // Use edge function instead of direct admin API
      const { data, error } = await supabase.functions.invoke("list-users-admin", {
        body: { page: 1, perPage: 100, search },
      });

      if (error) throw error;

      if (data?.users) {
        setUsers(data.users);
        setTotal(data.total || data.users.length);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
    }
  };

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error: any) {
      console.error("Error fetching invites:", error);
    }
  };

  const fetchRoleChanges = async () => {
    try {
      const { data, error } = await supabase
        .from("role_changes_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setRoleChanges((data || []) as any);
    } catch (error: any) {
      console.error("Error fetching role changes:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchInvites(), fetchRoleChanges()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const sendAdminInvite = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-admin-invite", {
        body: { email },
      });

      if (error) throw error;

      toast({
        title: "Convite enviado!",
        description: `Um email foi enviado para ${email} com o link de convite admin.`,
      });

      await fetchInvites();
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { data, error } = await supabase.functions.invoke("update-user-admin", {
        body: { 
          userId, 
          role: newRole,
          action: "update"
        },
      });

      if (error) throw error;

      toast({
        title: "Role alterado com sucesso",
        description: `Usuário agora tem o role: ${newRole}`,
      });

      await Promise.all([fetchUsers(), fetchRoleChanges()]);
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao alterar role",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const removeUserRole = async (userId: string) => {
    try {
      // Delete role directly from user_roles table
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Role removido",
        description: "Permissões de usuário removidas com sucesso.",
      });

      await Promise.all([fetchUsers(), fetchRoleChanges()]);
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao remover role",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const blockUser = async (userId: string, reason: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("block-user", {
        body: { userId, reason },
      });

      if (error) throw error;

      toast({
        title: "Usuário bloqueado",
        description: "O usuário foi bloqueado com sucesso.",
      });

      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao bloquear usuário",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("unblock-user", {
        body: { userId },
      });

      if (error) throw error;

      toast({
        title: "Usuário desbloqueado",
        description: "O usuário foi desbloqueado com sucesso.",
      });

      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao desbloquear usuário",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("update-user-admin", {
        body: { 
          userId, 
          action: "delete"
        },
      });

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido do sistema.",
      });

      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (userId: string, data: { full_name?: string; email?: string; phone?: string; role?: UserRole }) => {
    try {
      const { error } = await supabase.functions.invoke("update-user-admin", {
        body: { 
          userId, 
          ...data,
          action: "update"
        },
      });

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: "As informações foram atualizadas com sucesso.",
      });

      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const updateUserPlan = async (petShopId: string, plan: string, expiryDate: string | null) => {
    try {
      const updateData: any = {
        subscription_plan: plan,
      };

      if (expiryDate) {
        updateData.subscription_expires_at = expiryDate;
      } else {
        updateData.subscription_expires_at = null;
      }

      const { error } = await supabase
        .from("pet_shops")
        .update(updateData)
        .eq("id", petShopId);

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: `Plano alterado para ${plan.toUpperCase()} com sucesso.`,
      });

      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  return {
    users,
    invites,
    roleChanges,
    loading,
    total,
    sendAdminInvite,
    changeUserRole,
    removeUserRole,
    blockUser,
    unblockUser,
    deleteUser,
    updateUser,
    updateUserPlan,
    searchUsers: fetchUsers,
    refresh: async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchInvites(), fetchRoleChanges()]);
      setLoading(false);
    },
  };
};
