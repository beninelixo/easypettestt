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
  const [lastRoleUpdate, setLastRoleUpdate] = useState<number>(Date.now());
  const [roleSource, setRoleSource] = useState<'metadata' | 'database' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to log auth events
  const logAuthEvent = async (
    userId: string | null,
    eventType: 'login' | 'logout' | 'token_refresh' | 'role_fetch',
    eventStatus: 'success' | 'error' | 'pending',
    roleSource?: 'metadata' | 'database',
    userRole?: string,
    errorMessage?: string
  ) => {
    try {
      await supabase.from('auth_events_log').insert({
        user_id: userId,
        event_type: eventType,
        event_status: eventStatus,
        role_source: roleSource || null,
        user_role: userRole || null,
        ip_address: window.location.hostname,
        user_agent: navigator.userAgent,
        error_message: errorMessage || null,
      });
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  };

  // Memoize fetchUserRole to avoid recreation
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Fetching user role for:', userId);
      
      // ✅ NOVO: Special logging for beninelixo@gmail.com
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email === 'beninelixo@gmail.com') {
        console.log('🎯 ADMIN TARGET USER DETECTED:', {
          userId,
          email: userData.user.email,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "🎯 Admin Login Detectado",
          description: `Carregando roles para ${userData.user.email}...`,
          duration: 2000,
        });
      }
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error('❌ Error fetching roles:', error);
        await logAuthEvent(userId, 'role_fetch', 'error', undefined, undefined, error.message);
        throw error;
      }

      console.log('📋 User roles from DB:', data);

      // Se houver múltiplas roles, priorizar: admin > pet_shop > client
      if (data && data.length > 0) {
        const roles = data.map(r => r.role);
        
        let selectedRole: UserRole;
        if (roles.includes('admin')) {
          selectedRole = 'admin' as UserRole;
        } else if (roles.includes('pet_shop')) {
          selectedRole = 'pet_shop' as UserRole;
        } else if (roles.includes('client')) {
          selectedRole = 'client' as UserRole;
        } else {
          selectedRole = roles[0] as UserRole;
        }
        
        console.log('✅ Selected role:', selectedRole);
        setUserRole(selectedRole);
        setLastRoleUpdate(Date.now());
        setRoleSource('database');
        await logAuthEvent(userId, 'role_fetch', 'success', 'database', selectedRole);
        
        // ✅ NOVO: Toast visual for beninelixo@gmail.com
        const { data: userData2 } = await supabase.auth.getUser();
        if (userData2?.user?.email === 'beninelixo@gmail.com') {
          toast({
            title: "✅ Role Carregada com Sucesso",
            description: `Role: ${selectedRole} (fonte: database)`,
            duration: 3000,
          });
        }
      } else {
        console.log('⚠️ No roles found for user');
        await logAuthEvent(userId, 'role_fetch', 'error', undefined, undefined, 'No roles found in database');
      }
    } catch (error) {
      console.error("❌ Error fetching user role:", error);
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
        if (metaRole) {
          setUserRole(metaRole);
          setRoleSource('metadata');
          if (session?.user) {
            logAuthEvent(session.user.id, 'role_fetch', 'success', 'metadata', metaRole);
          }
        }
        
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
      let errorMessage = error.message;
      
      // Map specific errors to user-friendly messages
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        errorMessage = "📧 Este email já está cadastrado. Tente fazer login ou recuperar sua senha.";
      } else if (error.message.includes("weak password") || error.message.includes("Password")) {
        if (error.message.includes("pwned")) {
          errorMessage = "🚨 Esta senha foi encontrada em vazamentos de dados e não é segura. Escolha uma senha completamente diferente.";
        } else {
          errorMessage = "⚠️ Senha muito fraca. Use pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos especiais (@, #, $, etc.).";
        }
      } else if (error.message.includes("invalid email")) {
        errorMessage = "📧 Email inválido. Verifique se digitou corretamente.";
      }
      
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('🔐 Starting login for:', email);
      
      // Get client IP and user agent for rate limiting
      let ipAddress = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        const ipData = await ipResponse.json();
        if (ipData && ipData.ip) {
          ipAddress = ipData.ip;
        }
      } catch (ipError) {
        console.warn('Could not fetch IP address, using unknown:', ipError);
        ipAddress = 'unknown'; // Fallback seguro
      }

      console.log('📍 IP address:', ipAddress);

      // Call rate-limited login Edge Function
      console.log('🚀 Calling login edge function...');
      const { data: functionData, error: functionError } = await supabase.functions.invoke('login-with-rate-limit', {
        body: {
          email,
          password,
          ip_address: ipAddress,
          user_agent: navigator.userAgent
        }
      });

      // Handle edge function errors with specific messages
      if (functionError) {
        console.error('❌ Edge function error:', functionError);
        let errorMsg = '🔒 Erro ao fazer login. ';
        
        if (functionError.message.includes('non-2xx')) {
          errorMsg += 'Servidor temporariamente indisponível. Tente novamente em alguns instantes.';
        } else if (functionError.message.includes('network')) {
          errorMsg += 'Verifique sua conexão com a internet.';
        } else if (functionError.message.includes('timeout')) {
          errorMsg += 'A requisição demorou muito. Tente novamente.';
        } else {
          errorMsg = functionError.message;
        }
        
        throw new Error(errorMsg);
      }
      
      console.log('📦 Edge function response:', functionData);
      
      if (functionData?.error) {
        console.error('❌ Function returned error:', functionData.error);
        // Handle rate limiting specifically
        if (functionData.blocked) {
          throw new Error('⏱️ ' + (functionData.message || 'Muitas tentativas de login. Aguarde alguns minutos.'));
        }
        throw new Error('❌ ' + functionData.error);
      }

      console.log('✅ Setting session...');
      // Set session from Edge Function response
      const { session: returnedSession, user: returnedUser } = functionData;
      await supabase.auth.setSession({
        access_token: returnedSession.access_token,
        refresh_token: returnedSession.refresh_token
      });

      console.log('💾 Session set successfully');

      // Save email for remember me if enabled
      if (rememberMe) {
        localStorage.setItem('easypet_remember_me', 'true');
        localStorage.setItem('easypet_saved_email', email);
      } else {
        // If not remember me, mark session as temporary
        localStorage.setItem('easypet_session_temporary', 'true');
      }

      // Get user's name for personalized welcome
      const userName = returnedUser?.user_metadata?.full_name || 'usuário';

      toast({
        title: `Bem-vindo de volta, ${userName}!`,
        description: rememberMe ? "Você será conectado automaticamente na próxima visita." : "Login realizado com sucesso.",
      });

      console.log('✅ Login completed successfully');
      
      // Log successful login
      await logAuthEvent(returnedUser.id, 'login', 'success', roleSource || undefined, userRole || undefined);
      
      return { data: functionData, error: null };
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Map specific errors to user-friendly messages
      if (error.message === 'Invalid login credentials' || error.message.includes('credentials')) {
        errorMessage = '🔒 Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
      } else if (error.message.includes('blocked') || error.message.includes('bloqueado')) {
        errorMessage = '⏱️ Conta temporariamente bloqueada por muitas tentativas. Aguarde alguns minutos.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '🌐 Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message.includes('not confirmed') || error.message.includes('verificação')) {
        errorMessage = '📧 Email não verificado. Verifique sua caixa de entrada e confirme seu email.';
      }
      
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
      const userId = user?.id || null;
      
      // Clear remember me data
      localStorage.removeItem('easypet_remember_me');
      localStorage.removeItem('easypet_saved_email');
      localStorage.removeItem('easypet_session_temporary');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Log logout event
      if (userId) {
        await logAuthEvent(userId, 'logout', 'success');
      }

      setUser(null);
      setSession(null);
      setUserRole(null);
      setRoleSource(null);
      
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

  const forceRefreshAuth = async () => {
    if (!user) return;
    
    console.log('🔄 Force refreshing authentication...');
    setLoading(true);
    
    try {
      // Clear local state
      setUserRole(null);
      
      // Refetch role from database
      await fetchUserRole(user.id);
      
      toast({
        title: "✅ Autenticação Atualizada",
        description: "Roles recarregadas do banco de dados",
      });
    } catch (error) {
      console.error('❌ Error force refreshing auth:', error);
      toast({
        title: "❌ Erro ao Atualizar",
        description: "Não foi possível recarregar as permissões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    userRole,
    loading,
    lastRoleUpdate,
    roleSource,
    signUp,
    signIn,
    signOut,
    forceRefreshAuth,
  };
};
