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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
}

export const BlockUserDialog = ({ open, onOpenChange, userId, userEmail, onSuccess }: BlockUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleBlock = async () => {
    setLoading(true);
    try {
      if (!reason.trim()) {
        throw new Error('Por favor, informe o motivo do bloqueio');
      }

      const { data, error } = await supabase.functions.invoke('block-user', {
        body: { userId, reason }
      });

      if (error) throw error;

      toast({
        title: "🚫 Usuário Bloqueado",
        description: `${userEmail} foi bloqueado com sucesso`,
        variant: "destructive",
      });

      onOpenChange(false);
      setReason("");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: "Erro ao Bloquear Usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bloquear Usuário</DialogTitle>
          <DialogDescription>
            Você está prestes a bloquear <strong>{userEmail}</strong>. 
            Este usuário não poderá mais fazer login no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do Bloqueio *</Label>
            <Textarea
              id="reason"
              placeholder="Explique o motivo do bloqueio (ex: atividade suspeita, violação de termos, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
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
            onClick={handleBlock}
            disabled={loading || !reason.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bloqueando...
              </>
            ) : (
              '🚫 Confirmar Bloqueio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};