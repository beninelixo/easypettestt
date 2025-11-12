import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

/**
 * Global authentication redirect gate
 * Ensures authenticated users are always on their correct dashboard
 */
export const AppAuthRedirectGate = () => {
  const { user, userRole, loading, forceRefreshAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [waitingForRole, setWaitingForRole] = useState(false);
  const refreshAttemptedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear timeout on cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('🚪 AppAuthRedirectGate:', { 
      loading, 
      user: user?.email, 
      userRole, 
      currentPath: location.pathname,
      waitingForRole 
    });

    // Don't do anything while auth is loading
    if (loading) {
      return;
    }

    // Only redirect from home or auth pages
    const isRedirectablePage = location.pathname === '/' || location.pathname === '/auth';
    if (!isRedirectablePage || !user) {
      setWaitingForRole(false);
      return;
    }

    // User is authenticated and on redirectable page
    if (userRole) {
      // Role is available, redirect to appropriate dashboard
      const targetPath = getRoleBasedPath(userRole);
      console.log('✅ Gate: Redirecting to', targetPath, 'for role', userRole);
      setWaitingForRole(false);
      navigate(targetPath, { replace: true });
    } else {
      // User exists but role is not loaded yet
      if (!waitingForRole && !refreshAttemptedRef.current) {
        console.log('⏳ Gate: Waiting for role to load...');
        setWaitingForRole(true);
        
        // Wait 2 seconds for role to load naturally
        timeoutRef.current = setTimeout(async () => {
          if (!userRole && user && !refreshAttemptedRef.current) {
            console.log('🔄 Gate: Role still missing, forcing refresh...');
            refreshAttemptedRef.current = true;
            await forceRefreshAuth();
            
            // After force refresh, wait a bit more
            setTimeout(() => {
              if (!userRole) {
                // Still no role, navigate to safe default (client)
                console.log('⚠️ Gate: Role still missing after refresh, defaulting to /client/pets');
                navigate('/client/pets', { replace: true });
                setWaitingForRole(false);
              }
            }, 1000);
          }
        }, 2000);
      }
    }
  }, [user, userRole, loading, location.pathname, navigate, forceRefreshAuth, waitingForRole]);

  // Show loading overlay when waiting for role
  if (waitingForRole && user && !userRole) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando suas permissões...</p>
        </div>
      </div>
    );
  }

  return null;
};

function getRoleBasedPath(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "pet_shop":
      return "/professional/dashboard";
    case "client":
      return "/client/pets";
    case "tenant_admin":
      return "/tenant-dashboard";
    case "franchise_owner":
      return "/franchise-dashboard";
    default:
      return "/client/pets"; // Safe fallback
  }
}
