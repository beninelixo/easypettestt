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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useImpersonate } from "@/hooks/useImpersonate";

interface ImpersonateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userName: string;
}

export const ImpersonateUserDialog = ({ open, onOpenChange, userId, userEmail, userName }: ImpersonateUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("Suporte técnico");
  const { startImpersonation } = useImpersonate();

  const handleImpersonate = async () => {
    setLoading(true);
    try {
      const result = await startImpersonation(userId, reason);
      
      if (result.success) {
        // O redirect é feito automaticamente no hook
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error starting impersonation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>🎭 Impersonar Usuário</DialogTitle>
          <DialogDescription>
            Você está prestes a fazer login como <strong>{userName || userEmail}</strong>. 
            Esta ação será registrada nos logs de auditoria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Impersonação</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Auxiliar cliente com problema técnico"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p className="font-semibold">⚠️ Aviso Importante:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Você terá acesso total à conta deste usuário</li>
              <li>Todas as suas ações serão registradas</li>
              <li>Um banner vermelho ficará visível durante a impersonação</li>
              <li>Você pode voltar à sua conta a qualquer momento</li>
            </ul>
          </div>
        </div>

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
            type="button"
            variant="destructive"
            onClick={handleImpersonate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              '🎭 Confirmar Impersonação'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};