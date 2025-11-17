import { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppModule, AppAction } from "@/hooks/useEmployeePermissions";

interface PermissionGuardProps {
  children: ReactNode;
  petShopId: string | undefined;
  module: AppModule;
  action: AppAction;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  showError?: boolean;
}

/**
 * Componente que protege conteúdo baseado em permissões
 * Só renderiza os children se o usuário tiver a permissão necessária
 */
export const PermissionGuard = ({
  children,
  petShopId,
  module,
  action,
  fallback,
  loadingFallback,
  showError = true,
}: PermissionGuardProps) => {
  const { hasPermission, loading } = usePermission(petShopId, module, action);

  if (loading) {
    return loadingFallback || (
      <Skeleton className="w-full h-20" />
    );
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta funcionalidade.
            Entre em contato com o administrador.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};

/**
 * HOC para proteger componentes com permissão
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  petShopId: string | undefined,
  module: AppModule,
  action: AppAction
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <PermissionGuard
        petShopId={petShopId}
        module={module}
        action={action}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
}
