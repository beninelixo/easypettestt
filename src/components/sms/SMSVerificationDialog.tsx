import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useSMSVerification } from '@/hooks/useSMSVerification';
import { Loader2, Phone } from 'lucide-react';

interface SMSVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function SMSVerificationDialog({ open, onOpenChange, onComplete }: SMSVerificationDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const { loading, codeSent, sendVerificationCode, verifyCode, setCodeSent } = useSMSVerification();

  const handleSendCode = async () => {
    if (!phoneNumber) return;
    await sendVerificationCode(phoneNumber);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;
    
    const success = await verifyCode(verificationCode);
    if (success) {
      onComplete?.();
      onOpenChange(false);
      setCodeSent(false);
      setPhoneNumber('');
      setVerificationCode('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificação por SMS</DialogTitle>
          <DialogDescription>
            Adicione uma camada extra de segurança verificando seu número de telefone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!codeSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+55 11 99999-9999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                  <Button onClick={handleSendCode} disabled={loading || !phoneNumber}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Código de Verificação</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button 
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar Código
              </Button>

              <Button 
                variant="ghost"
                onClick={() => setCodeSent(false)}
                className="w-full"
              >
                Enviar novo código
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
