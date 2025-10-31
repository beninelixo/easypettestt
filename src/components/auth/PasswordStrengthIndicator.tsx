import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator = ({ password, showRequirements = true }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    let label = '';
    let color = '';

    if (score <= 40) {
      label = 'Fraca';
      color = 'bg-destructive';
    } else if (score <= 60) {
      label = 'Média';
      color = 'bg-amber-500';
    } else if (score <= 80) {
      label = 'Boa';
      color = 'bg-blue-500';
    } else {
      label = 'Forte';
      color = 'bg-accent';
    }

    return { score, label, color, checks };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Força da senha:</span>
          <span className={`font-medium ${
            strength.score <= 40 ? 'text-destructive' :
            strength.score <= 60 ? 'text-amber-500' :
            strength.score <= 80 ? 'text-blue-500' :
            'text-accent'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1 text-xs">
          <div className={`flex items-center gap-1 ${strength.checks?.length ? 'text-accent' : 'text-muted-foreground'}`}>
            {strength.checks?.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Mínimo 8 caracteres</span>
          </div>
          <div className={`flex items-center gap-1 ${strength.checks?.lowercase ? 'text-accent' : 'text-muted-foreground'}`}>
            {strength.checks?.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Uma letra minúscula</span>
          </div>
          <div className={`flex items-center gap-1 ${strength.checks?.uppercase ? 'text-accent' : 'text-muted-foreground'}`}>
            {strength.checks?.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Uma letra maiúscula</span>
          </div>
          <div className={`flex items-center gap-1 ${strength.checks?.number ? 'text-accent' : 'text-muted-foreground'}`}>
            {strength.checks?.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Um número</span>
          </div>
          {strength.checks?.special && (
            <div className="flex items-center gap-1 text-accent">
              <Check className="h-3 w-3" />
              <span>Caractere especial (bônus)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
