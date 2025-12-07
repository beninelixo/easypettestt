import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, Check, X, Loader2 } from "lucide-react";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { Progress } from "@/components/ui/progress";

interface ChangeSettingsPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export function ChangeSettingsPasswordDialog({
  open,
  onOpenChange,
  onSubmit,
}: ChangeSettingsPasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { strength, checks, isValid } = usePasswordValidation(newPassword);

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = currentPassword.length > 0 && isValid && passwordsMatch && !loading;

  const getStrengthColor = () => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength <= 25) return "Muito fraca";
    if (strength <= 50) return "Fraca";
    if (strength <= 75) return "Boa";
    return "Forte";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    setLoading(true);
    try {
      const success = await onSubmit(currentPassword, newPassword);
      if (success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Alterar Senha de Configurações
          </DialogTitle>
          <DialogDescription>
            Digite sua senha atual e a nova senha para alterar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength */}
            {newPassword.length > 0 && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Força da senha:</span>
                  <span className={`font-medium ${
                    strength <= 25 ? 'text-red-500' :
                    strength <= 50 ? 'text-orange-500' :
                    strength <= 75 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <Progress value={strength} className={`h-2 [&>div]:${getStrengthColor()}`} />
                
                <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                  {Object.entries(checks).map(([key, value]) => (
                    <div 
                      key={key} 
                      className={`flex items-center gap-1 ${value ? 'text-green-600' : 'text-muted-foreground'}`}
                    >
                      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>
                        {key === 'minLength' && 'Mín. 10 caracteres'}
                        {key === 'hasUppercase' && 'Letra maiúscula'}
                        {key === 'hasLowercase' && 'Letra minúscula'}
                        {key === 'hasNumber' && 'Número'}
                        {key === 'hasSpecialChar' && 'Caractere especial'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className={`pr-10 ${
                  confirmPassword.length > 0 
                    ? passwordsMatch 
                      ? 'border-green-500 focus-visible:ring-green-500' 
                      : 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-500">As senhas não coincidem</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
