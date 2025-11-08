import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download } from "lucide-react";

interface MFABackupCodesProps {
  backupCodes: string[];
}

export function MFABackupCodes({ backupCodes }: MFABackupCodesProps) {
  const downloadCodes = () => {
    const text = `CÓDIGOS DE BACKUP MFA - EasyPet\n\nGuarde estes códigos em local seguro. Cada código pode ser usado apenas uma vez.\n\n${backupCodes.join('\n')}\n\nData: ${new Date().toLocaleDateString('pt-BR')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easypet-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Códigos de Backup</CardTitle>
        <CardDescription>
          Guarde estes códigos em local seguro. Use-os se perder acesso ao autenticador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>IMPORTANTE:</strong> Cada código pode ser usado apenas UMA vez. Guarde-os com segurança!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
          {backupCodes.map((code, index) => (
            <div key={index} className="p-2 bg-background rounded border">
              {code}
            </div>
          ))}
        </div>

        <Button onClick={downloadCodes} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Baixar Códigos
        </Button>
      </CardContent>
    </Card>
  );
}
