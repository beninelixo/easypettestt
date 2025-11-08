import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

interface MFATokenInputProps {
  onVerify: (token: string) => Promise<boolean>;
  loading?: boolean;
}

export function MFATokenInput({ onVerify, loading }: MFATokenInputProps) {
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (token.length !== 6) return;
    
    setVerifying(true);
    await onVerify(token);
    setVerifying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificar Código</CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos do seu app autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={token}
            onChange={(value) => setToken(value)}
            disabled={loading || verifying}
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

        <Button 
          onClick={handleVerify}
          disabled={token.length !== 6 || loading || verifying}
          className="w-full"
        >
          {(loading || verifying) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verificar e Ativar MFA
        </Button>
      </CardContent>
    </Card>
  );
}
