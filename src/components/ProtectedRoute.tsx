import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useTenant } from "@/lib/tenant-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading: authLoading } = useAuth();
  const { userRole: tenantRole, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  
  const loading = authLoading || tenantLoading;
  const effectiveRole = tenantRole || userRole;
  const normalizedRole = effectiveRole === "unit_manager" ? "pet_shop" : effectiveRole;

  useEffect(() => {
    console.log('🔒 ProtectedRoute check:', { loading, user: !!user, normalizedRole, allowedRoles });
    
    if (!loading) {
      if (!user) {
        console.log('❌ No user, redirecting to /auth');
        navigate("/auth", { replace: true });
      } else if (allowedRoles && normalizedRole && !allowedRoles.includes(normalizedRole as UserRole)) {
        // Redirect to appropriate dashboard based on role
        const targetPath = (() => {
          if (normalizedRole === "tenant_admin") return "/tenant-dashboard";
          if (normalizedRole === "franchise_owner") return "/franchise-dashboard";
          if (normalizedRole === "pet_shop") return "/professional/dashboard";
          if (normalizedRole === "client") return "/client/pets";
          if (normalizedRole === "admin") return "/admin/dashboard";
          return "/";
        })();
        
        console.log('🔀 Wrong role, redirecting to:', targetPath);
        navigate(targetPath, { replace: true });
      } else {
        console.log('✅ Access granted');
      }
    }
  }, [user, normalizedRole, loading, navigate, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && normalizedRole && !allowedRoles.includes(normalizedRole as UserRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
