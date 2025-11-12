import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "client" | "pet_shop" | "admin";

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role: UserRole | null;
  created_at: string;
  phone?: string;
  avatar_url?: string;
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
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      // Get all auth users via admin API
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) throw authError;

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url");

      // Get roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Combine data
      const usersWithRoles: UserWithRole[] = authUsers.users.map((user) => {
        const profile = profiles?.find((p) => p.id === user.id);
        const roleData = roles?.find((r) => r.user_id === user.id);

        return {
          id: user.id,
          email: user.email || "",
          full_name: profile?.full_name || user.user_metadata?.full_name || "Sem nome",
          role: roleData?.role as UserRole || null,
          created_at: user.created_at,
          phone: profile?.phone,
          avatar_url: profile?.avatar_url,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
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
      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

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

  return {
    users,
    invites,
    roleChanges,
    loading,
    sendAdminInvite,
    changeUserRole,
    removeUserRole,
    refresh: async () => {
      await Promise.all([fetchUsers(), fetchInvites(), fetchRoleChanges()]);
    },
  };
};