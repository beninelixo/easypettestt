import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";

interface SettingsPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "verify";
  onSubmit: (password: string, confirmPassword?: string) => Promise<boolean>;
  attempts?: number;
  maxAttempts?: number;
}

export const SettingsPasswordDialog = ({
  open,
  onOpenChange,
  mode,
  onSubmit,
  attempts = 0,
  maxAttempts = 3,
}: SettingsPasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "create" && password !== confirmPassword) {
      return;
    }

    setLoading(true);
    const success = await onSubmit(password, mode === "create" ? confirmPassword : undefined);
    setLoading(false);

    if (success) {
      setPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    }
  };

  const remainingAttempts = maxAttempts - attempts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <DialogTitle>
              {mode === "create"
                ? "Criar Senha de Configurações"
                : "Senha de Configurações"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === "create"
              ? "Esta será sua senha para acessar as configurações avançadas. Guarde-a com segurança."
              : `Digite a senha para acessar as configurações. ${
                  remainingAttempts > 0
                    ? `Tentativas restantes: ${remainingAttempts}`
                    : "Sem tentativas restantes."
                }`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {mode === "create" ? "Nova Senha" : "Senha"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "create" ? "Mínimo 8 caracteres" : "Digite a senha"}
                minLength={mode === "create" ? 8 : undefined}
                required
                disabled={loading || (mode === "verify" && remainingAttempts === 0)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  minLength={8}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {password !== confirmPassword && confirmPassword && (
                <p className="text-sm text-destructive">As senhas não coincidem</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !password ||
                (mode === "create" && password !== confirmPassword) ||
                (mode === "verify" && remainingAttempts === 0)
              }
            >
              {loading ? "Processando..." : mode === "create" ? "Criar Senha" : "Acessar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
