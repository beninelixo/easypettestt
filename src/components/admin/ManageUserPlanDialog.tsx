import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Crown } from "lucide-react";

interface ManageUserPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petShopId: string | null;
  petShopName: string;
  currentPlan: string | null;
  currentExpiry: string | null;
  onConfirm: (petShopId: string, plan: string, expiryDate: string | null) => Promise<{ success: boolean }>;
}

const planOptions = [
  { value: "free", label: "Gratuito" },
  { value: "gold", label: "Gold (Mensal)" },
  { value: "platinum", label: "Platinum (Mensal)" },
  { value: "pet_gold_anual", label: "Gold (Anual)" },
  { value: "pet_platinum_anual", label: "Platinum (Anual)" },
];

export const ManageUserPlanDialog = ({
  open,
  onOpenChange,
  petShopId,
  petShopName,
  currentPlan,
  currentExpiry,
  onConfirm,
}: ManageUserPlanDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(currentPlan || "free");
  const [expiryDate, setExpiryDate] = useState(
    currentExpiry ? currentExpiry.split("T")[0] : ""
  );

  useEffect(() => {
    setPlan(currentPlan || "free");
    setExpiryDate(currentExpiry ? currentExpiry.split("T")[0] : "");
  }, [currentPlan, currentExpiry, open]);

  const handleConfirm = async () => {
    if (!petShopId) return;

    setLoading(true);
    const result = await onConfirm(petShopId, plan, expiryDate || null);
    setLoading(false);

    if (result.success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Gerenciar Plano
          </DialogTitle>
          <DialogDescription>
            Altere o plano de assinatura de <strong>{petShopName}</strong>
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
                {planOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
