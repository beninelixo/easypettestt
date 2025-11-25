import { memo } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PrivacyNoticeProps {
  message?: string;
  showIcon?: boolean;
  className?: string;
}

/**
 * Componente reutilizável de aviso de privacidade
 * Usado em uploads de avatar e outros contextos de dados públicos
 * GDPR/LGPD compliant
 */
export const PrivacyNotice = memo(({ 
  message = "Aviso de Privacidade: Esta informação será visível publicamente. Não use dados sensíveis.",
  showIcon = true,
  className = ""
}: PrivacyNoticeProps) => {
  return (
    <Alert 
      className={`border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 ${className}`}
      role="alert"
      aria-live="polite"
      aria-label="Aviso de privacidade"
    >
      {showIcon && <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
      <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
        <strong>⚠️ {message}</strong>
      </AlertDescription>
    </Alert>
  );
});

PrivacyNotice.displayName = "PrivacyNotice";
