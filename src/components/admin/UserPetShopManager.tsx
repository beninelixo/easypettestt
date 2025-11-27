import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface UserPetShopManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petShopId: string | null;
  currentPlan: string;
  currentExpiry: string | null;
  onSuccess?: () => void;
}

export const UserPetShopManager = ({
  open,
  onOpenChange,
  petShopId,
  currentPlan,
  currentExpiry,
  onSuccess,
}: UserPetShopManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(currentPlan || "free");
  const [expiryDate, setExpiryDate] = useState(
    currentExpiry ? currentExpiry.split("T")[0] : ""
  );

  const handleUpdatePlan = async () => {
    if (!petShopId) return;

    setLoading(true);
    try {
      const updateData: any = {
        subscription_plan: plan,
      };

      if (expiryDate) {
        updateData.subscription_expires_at = expiryDate;
      } else {
        updateData.subscription_expires_at = null;
      }

      const { error } = await supabase
        .from("pet_shops")
        .update(updateData)
        .eq("id", petShopId);

      if (error) throw error;

      toast({
        title: "Plano atualizado!",
        description: `Plano alterado para ${plan.toUpperCase()} com sucesso.`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating plan:", error);
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Plano do Pet Shop</DialogTitle>
          <DialogDescription>
            Altere o plano de assinatura e a data de expiração
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Plano de Assinatura</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger id="plan">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Data de Expiração (opcional)</Label>
            <div className="relative">
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Deixe em branco para assinatura sem data de expiração
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdatePlan} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
