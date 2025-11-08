import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMFA } from "@/hooks/useMFA";
import { MFAQRCode } from "./MFAQRCode";
import { MFATokenInput } from "./MFATokenInput";
import { MFABackupCodes } from "./MFABackupCodes";
import { Shield, ArrowRight, CheckCircle2 } from "lucide-react";

interface MFASetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function MFASetupWizard({ open, onOpenChange, onComplete }: MFASetupWizardProps) {
  const [step, setStep] = useState(1);
  const [mfaData, setMfaData] = useState<{
    secret?: string;
    qr_code_url?: string;
    backup_codes?: string[];
  }>({});
  const { setupMFA, verifyToken, loading } = useMFA();

  const handleStart = async () => {
    const result = await setupMFA();
    if (result.success && result.secret && result.qr_code_url && result.backup_codes) {
      setMfaData({
        secret: result.secret,
        qr_code_url: result.qr_code_url,
        backup_codes: result.backup_codes,
      });
      setStep(2);
    }
  };

  const handleVerify = async (token: string): Promise<boolean> => {
    const result = await verifyToken(token, true);
    if (result.valid) {
      setStep(3);
      return true;
    }
    return false;
  };

  const handleComplete = () => {
    onOpenChange(false);
    onComplete?.();
    setStep(1);
    setMfaData({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Configurar Autenticação de Dois Fatores (MFA)
          </DialogTitle>
          <DialogDescription>
            Passo {step} de 3 - Aumente a segurança da sua conta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-6 border rounded-lg space-y-4">
                <h3 className="font-semibold">Por que ativar MFA?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Proteção extra contra acessos não autorizados</li>
                  <li>✓ Códigos temporários de 6 dígitos que mudam a cada 30 segundos</li>
                  <li>✓ Funciona mesmo sem internet após configurado</li>
                  <li>✓ Códigos de backup para emergências</li>
                </ul>
              </div>
              <Button onClick={handleStart} disabled={loading} className="w-full">
                {loading ? "Gerando..." : "Começar Configuração"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && mfaData.qr_code_url && mfaData.secret && (
            <div className="space-y-4">
              <MFAQRCode qrCodeUrl={mfaData.qr_code_url} secret={mfaData.secret} />
              <MFATokenInput onVerify={handleVerify} loading={loading} />
            </div>
          )}

          {step === 3 && mfaData.backup_codes && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 text-primary rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">MFA Ativado com Sucesso!</span>
              </div>
              <MFABackupCodes backupCodes={mfaData.backup_codes} />
              <Button onClick={handleComplete} className="w-full">
                Concluir
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
