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
        navigate("/auth");
      } else if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole as UserRole)) {
        // Redirect to appropriate dashboard based on role
        if (effectiveRole === "tenant_admin") {
          navigate("/tenant-dashboard");
        } else if (effectiveRole === "franchise_owner") {
          navigate("/franchise-dashboard");
        } else if (effectiveRole === "unit_manager" || effectiveRole === "pet_shop") {
          navigate("/petshop-dashboard");
        } else if (effectiveRole === "client") {
          navigate("/client-dashboard");
        } else if (effectiveRole === "admin") {
          navigate("/admin-dashboard");
        }
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
