import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getErrorTipFromMessage, ErrorTip } from '@/lib/error-tips';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowRight, Copy, Check, ExternalLink } from 'lucide-react';

export const useAdminErrorToast = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState<ErrorTip | null>(null);
  const [copied, setCopied] = useState(false);

  const showErrorWithTip = useCallback((title: string, message: string) => {
    const tip = getErrorTipFromMessage(message);
    
    toast({
      title,
      description: message,
      variant: 'destructive',
      action: tip ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-white/20 text-white hover:bg-white/10"
          onClick={() => {
            setCurrentTip(tip);
            setTipDialogOpen(true);
          }}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          Ver dica
        </Button>
      ) : undefined,
    });
  }, [toast]);

  const handleCopySteps = async () => {
    if (!currentTip) return;
    
    const stepsText = currentTip.steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    const fullText = `${currentTip.title}\n\n${currentTip.description}\n\nPassos para resolver:\n${stepsText}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const TipDialog = () => (
    <Dialog open={tipDialogOpen} onOpenChange={setTipDialogOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            {currentTip?.title || 'Dica de Resolução'}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant={
              currentTip?.severity === 'critical' || currentTip?.severity === 'high' 
                ? 'destructive' 
                : currentTip?.severity === 'medium' 
                  ? 'default' 
                  : 'secondary'
            }>
              {currentTip?.severity === 'critical' ? 'Crítico' : 
               currentTip?.severity === 'high' ? 'Alto' :
               currentTip?.severity === 'medium' ? 'Médio' : 'Baixo'}
            </Badge>
            <Badge variant="outline">{currentTip?.category}</Badge>
          </DialogDescription>
        </DialogHeader>

        {currentTip && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {currentTip.description}
            </p>

            <div>
              <h4 className="text-sm font-medium mb-3">Passos para resolver:</h4>
              <ol className="space-y-2">
                {currentTip.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {currentTip.quickAction && (
                <Button 
                  onClick={() => {
                    setTipDialogOpen(false);
                    navigate(currentTip.quickAction!.route);
                  }}
                  className="gap-1"
                >
                  <ArrowRight className="h-4 w-4" />
                  {currentTip.quickAction.label}
                </Button>
              )}
              
              <Button variant="outline" onClick={handleCopySteps} className="gap-1">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar passos
                  </>
                )}
              </Button>

              {currentTip.documentationUrl && (
                <Button 
                  variant="ghost" 
                  onClick={() => window.open(currentTip.documentationUrl, '_blank')}
                  className="gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Documentação
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return {
    showErrorWithTip,
    TipDialog,
  };
};
