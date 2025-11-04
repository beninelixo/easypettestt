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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth", { replace: true });
      } else if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole as UserRole)) {
        // Redirect to appropriate dashboard based on role
        const targetPath = (() => {
          if (effectiveRole === "tenant_admin") return "/tenant-dashboard";
          if (effectiveRole === "franchise_owner") return "/franchise-dashboard";
          if (effectiveRole === "unit_manager" || effectiveRole === "pet_shop") return "/petshop-dashboard";
          if (effectiveRole === "client") return "/client-dashboard";
          if (effectiveRole === "admin") return "/admin-dashboard";
          return "/";
        })();
        
        navigate(targetPath, { replace: true });
      }
    }
  }, [user, effectiveRole, loading, navigate, allowedRoles]);

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

  if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole as UserRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
