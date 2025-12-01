import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface SettingsPassword {
  id: string;
  pet_shop_id: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export const useSettingsPassword = (petShopId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkPasswordExists();
  }, [petShopId, user]);

  const checkPasswordExists = async () => {
    if (!petShopId || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("settings_passwords")
        .select("id")
        .eq("pet_shop_id", petShopId)
        .maybeSingle();

      if (error) throw error;

      setHasPassword(!!data);
    } catch (error: any) {
      console.error("Error checking settings password:", error);
      toast({
        title: "Erro",
        description: "Erro ao verificar senha de configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPassword = async (password: string): Promise<boolean> => {
    if (!petShopId || !user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar autenticado para criar uma senha.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Hash password using bcrypt via edge function
      const { data: hashData, error: hashError } = await supabase.functions.invoke(
        "hash-password",
        {
          body: { password },
        }
      );

      if (hashError) {
        throw new Error(`Falha ao gerar hash da senha: ${hashError.message}`);
      }

      if (!hashData?.hash) {
        throw new Error("Hash da senha não foi retornado pelo servidor.");
      }

      const { error: insertError } = await supabase.from("settings_passwords").insert({
        pet_shop_id: petShopId,
        password_hash: hashData.hash,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("Já existe uma senha configurada para este pet shop.");
        }
        throw new Error(`Erro ao salvar senha no banco: ${insertError.message}`);
      }

      setHasPassword(true);
      setIsAuthenticated(true);
      
      toast({
        title: "Sucesso",
        description: "Senha de configurações criada com sucesso!",
      });

      return true;
    } catch (error: any) {
      console.error("Error creating settings password:", error);
      toast({
        title: "Erro ao Criar Senha",
        description: error.message || "Não foi possível criar a senha. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!petShopId || !user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar autenticado para verificar a senha.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: hashData, error: hashError } = await supabase
        .from("settings_passwords")
        .select("password_hash")
        .eq("pet_shop_id", petShopId)
        .single();

      if (hashError) {
        if (hashError.code === "PGRST116") {
          throw new Error("Nenhuma senha configurada para este pet shop.");
        }
        throw new Error(`Erro ao buscar senha no banco: ${hashError.message}`);
      }

      // Verify password using bcrypt via edge function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        "verify-password",
        {
          body: {
            password,
            hash: hashData.password_hash,
          },
        }
      );

      if (verifyError) {
        throw new Error(`Falha ao verificar senha: ${verifyError.message}`);
      }

      if (verifyData?.valid) {
        setIsAuthenticated(true);
        toast({
          title: "Acesso Liberado",
          description: "Senha verificada com sucesso!",
        });
        return true;
      } else {
        toast({
          title: "Senha Incorreta",
          description: "A senha informada não está correta. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error verifying settings password:", error);
      toast({
        title: "Erro ao Verificar Senha",
        description: error.message || "Não foi possível verificar a senha. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!petShopId || !user) return false;

    try {
      // First verify current password
      const isValid = await verifyPassword(currentPassword);
      if (!isValid) return false;

      // Hash new password
      const { data: hashData, error: hashError } = await supabase.functions.invoke(
        "hash-password",
        {
          body: { password: newPassword },
        }
      );

      if (hashError) throw hashError;

      const { error } = await supabase
        .from("settings_passwords")
        .update({ password_hash: hashData.hash })
        .eq("pet_shop_id", petShopId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso!",
      });

      return true;
    } catch (error: any) {
      console.error("Error updating settings password:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar senha",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetAuthentication = () => {
    setIsAuthenticated(false);
  };

  return {
    hasPassword,
    loading,
    isAuthenticated,
    createPassword,
    verifyPassword,
    updatePassword,
    resetAuthentication,
    checkPasswordExists,
  };
};
