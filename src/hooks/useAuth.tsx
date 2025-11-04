import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "client" | "pet_shop" | "admin";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Memoize fetchUserRole to avoid recreation
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.role) {
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setUserRole(null);
          setLoading(false);
        }

        // Provisional role from user metadata to avoid navigation deadlocks
        const metaRole = (session?.user?.user_metadata?.user_type as UserRole) || null;
        if (metaRole) setUserRole(metaRole);
        
        if (session?.user) {
          // Fetch role from DB after session is set (authoritative)
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado em instantes...",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Get client IP and user agent for rate limiting
      let ipAddress = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (ipError) {
        console.warn('Could not fetch IP address:', ipError);
      }

      // Call rate-limited login Edge Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('login-with-rate-limit', {
        body: {
          email,
          password,
          ip_address: ipAddress,
          user_agent: navigator.userAgent
        }
      });

      if (functionError) throw functionError;
      
      if (functionData.error) {
        // Handle rate limiting specifically
        if (functionData.blocked) {
          throw new Error(functionData.message || 'Muitas tentativas de login');
        }
        throw new Error(functionData.error);
      }

      // Set session from Edge Function response
      const { session: returnedSession, user: returnedUser } = functionData;
      await supabase.auth.setSession({
        access_token: returnedSession.access_token,
        refresh_token: returnedSession.refresh_token
      });

      // Save email for remember me if enabled
      if (rememberMe) {
        localStorage.setItem('bointhosa_remember_me', 'true');
        localStorage.setItem('bointhosa_saved_email', email);
      }

      // Get user's name for personalized welcome
      const userName = returnedUser?.user_metadata?.full_name || 'usuário';

      toast({
        title: `Bem-vindo de volta, ${userName}!`,
        description: rememberMe ? "Você será conectado automaticamente na próxima visita." : "Login realizado com sucesso.",
      });

      return { data: functionData, error: null };
    } catch (error: any) {
      const errorMessage = error.message === 'Invalid login credentials' 
        ? 'Email ou senha incorretos'
        : error.message;
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Clear remember me data
      localStorage.removeItem('bointhosa_remember_me');
      localStorage.removeItem('bointhosa_saved_email');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Navigate first, then show toast to avoid navigation issues
      navigate("/");
      
      setTimeout(() => {
        toast({
          title: "Logout realizado",
          description: "Até logo!",
        });
      }, 100);
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
