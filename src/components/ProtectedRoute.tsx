import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useTenant } from "@/lib/tenant-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading: authLoading, forceRefreshAuth, isGodUser } = useAuth();
  const { userRole: tenantRole, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  
  const loading = authLoading || tenantLoading;
  const effectiveRole = tenantRole || userRole;
  
  // Normalize role and handle super_admin
  let normalizedRole = effectiveRole === "unit_manager" ? "pet_shop" : effectiveRole;
  // Treat super_admin as admin with extra privileges
  if (normalizedRole === "super_admin") {
    normalizedRole = "admin";
  }

  const forceRefreshAttemptedRef = useRef(false);
  const [awaitingRole, setAwaitingRole] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔒 ProtectedRoute check:', { loading, user: !!user, normalizedRole, allowedRoles });
    }
    
    if (!loading) {
      if (!user) {
        if (import.meta.env.DEV) {
          console.log('❌ No user, clearing invalid tokens and redirecting to /auth');
        }
        // Limpar tokens potencialmente corrompidos
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        navigate("/auth", { replace: true });
      } else if (allowedRoles && !normalizedRole) {
        // User exists, allowedRoles specified, but role not loaded yet
        if (import.meta.env.DEV) {
          console.log('⏳ ProtectedRoute: Waiting for role to load...');
        }
        setAwaitingRole(true);
        
        // Wait for role with timeout
        const timeout = setTimeout(async () => {
          if (!normalizedRole && !forceRefreshAttemptedRef.current) {
            if (import.meta.env.DEV) {
              console.log('🔄 ProtectedRoute: Role missing, forcing refresh...');
            }
            forceRefreshAttemptedRef.current = true;
            await forceRefreshAuth();
            
            // After refresh attempt, wait a bit more
            setTimeout(() => {
              if (!normalizedRole) {
                if (import.meta.env.DEV) {
                  console.log('❌ ProtectedRoute: Role still missing after refresh, redirecting to /auth');
                }
                navigate("/auth?role=missing", { replace: true });
              }
            }, 1000);
          }
        }, 2000);
        
        return () => clearTimeout(timeout);
      } else if (allowedRoles && normalizedRole && !allowedRoles.includes(normalizedRole as UserRole) && !isGodUser) {
        setAwaitingRole(false);
        // God User bypasses all role restrictions
        // Redirect to appropriate dashboard based on role
        const targetPath = (() => {
          if (normalizedRole === "tenant_admin") return "/tenant-dashboard";
          if (normalizedRole === "franchise_owner") return "/franchise-dashboard";
          if (normalizedRole === "pet_shop") return "/professional/dashboard";
          if (normalizedRole === "client") return "/client/pets";
          if (normalizedRole === "admin") return "/admin/dashboard";
          return "/";
        })();
        
        if (import.meta.env.DEV) {
          console.log('🔀 Wrong role, redirecting to:', targetPath);
        }
        navigate(targetPath, { replace: true });
      } else {
        setAwaitingRole(false);
        if (import.meta.env.DEV) {
          console.log('✅ Access granted');
        }
      }
    }
  }, [user, normalizedRole, loading, navigate, allowedRoles, forceRefreshAuth]);

  // Show loader while loading auth or waiting for role
  if (loading || awaitingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {awaitingRole && <p className="text-sm text-muted-foreground">Carregando permissões...</p>}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // God User bypasses all role restrictions
  if (allowedRoles && normalizedRole && !allowedRoles.includes(normalizedRole as UserRole) && !isGodUser) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
