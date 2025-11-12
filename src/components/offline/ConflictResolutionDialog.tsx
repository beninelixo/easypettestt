import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Database, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DataConflict {
  id: string;
  table: string;
  recordId: string;
  localVersion: any;
  serverVersion: any;
  localTimestamp: number;
  serverTimestamp: number;
}

interface ConflictResolutionDialogProps {
  conflicts: DataConflict[];
  open: boolean;
  onResolve: (resolutions: Map<string, 'local' | 'server' | 'merge'>) => void;
  onCancel: () => void;
}

export const ConflictResolutionDialog = ({
  conflicts,
  open,
  onResolve,
  onCancel,
}: ConflictResolutionDialogProps) => {
  const [resolutions, setResolutions] = useState<Map<string, 'local' | 'server' | 'merge'>>(
    new Map()
  );

  const handleResolve = (conflictId: string, resolution: 'local' | 'server' | 'merge') => {
    const newResolutions = new Map(resolutions);
    newResolutions.set(conflictId, resolution);
    setResolutions(newResolutions);
  };

  const handleSubmit = () => {
    onResolve(resolutions);
  };

  const allResolved = conflicts.every((c) => resolutions.has(c.id));

  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conflitos de Sincronização Detectados</DialogTitle>
          <DialogDescription>
            Os dados foram modificados tanto online quanto offline. Escolha qual versão manter para
            cada conflito.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <Card key={conflict.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>
                      {conflict.table} - ID: {conflict.recordId.slice(0, 8)}...
                    </span>
                    <Badge variant={resolutions.has(conflict.id) ? 'default' : 'secondary'}>
                      {resolutions.has(conflict.id) ? 'Resolvido' : 'Pendente'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Versão Local */}
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Smartphone className="h-4 w-4" />
                        Versão Local (Offline)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(conflict.localTimestamp, "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(conflict.localVersion, null, 2)}
                      </pre>
                      <Button
                        size="sm"
                        variant={resolutions.get(conflict.id) === 'local' ? 'default' : 'outline'}
                        onClick={() => handleResolve(conflict.id, 'local')}
                        className="w-full"
                      >
                        Manter Versão Local
                      </Button>
                    </div>

                    {/* Versão do Servidor */}
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Database className="h-4 w-4" />
                        Versão do Servidor (Online)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(conflict.serverTimestamp, "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(conflict.serverVersion, null, 2)}
                      </pre>
                      <Button
                        size="sm"
                        variant={resolutions.get(conflict.id) === 'server' ? 'default' : 'outline'}
                        onClick={() => handleResolve(conflict.id, 'server')}
                        className="w-full"
                      >
                        Manter Versão do Servidor
                      </Button>
                    </div>
                  </div>

                  {/* Opção de Merge */}
                  <Button
                    size="sm"
                    variant={resolutions.get(conflict.id) === 'merge' ? 'default' : 'outline'}
                    onClick={() => handleResolve(conflict.id, 'merge')}
                    className="w-full"
                  >
                    Mesclar Automaticamente (Merge)
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!allResolved}>
            Aplicar Resoluções ({resolutions.size}/{conflicts.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
