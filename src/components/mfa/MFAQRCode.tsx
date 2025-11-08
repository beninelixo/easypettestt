import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface MFAQRCodeProps {
  qrCodeUrl: string;
  secret: string;
}

export function MFAQRCode({ qrCodeUrl, secret }: MFAQRCodeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Escanear QR Code</CardTitle>
        <CardDescription>
          Use um app autenticador como Google Authenticator, Authy ou Microsoft Authenticator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-6 bg-background border rounded-lg">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
            alt="QR Code MFA"
            className="w-48 h-48"
          />
        </div>
        
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Não consegue escanear?</strong> Digite manualmente:
            <code className="block mt-2 p-2 bg-muted rounded text-sm break-all">
              {secret}
            </code>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
