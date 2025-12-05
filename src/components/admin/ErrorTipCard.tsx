import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ExternalLink, Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ErrorTip, getSeverityBadgeVariant } from '@/lib/error-tips';
import { cn } from '@/lib/utils';

interface ErrorTipCardProps {
  tip: ErrorTip;
  className?: string;
  defaultExpanded?: boolean;
}

export const ErrorTipCard = ({ tip, className, defaultExpanded = false }: ErrorTipCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCopySteps = async () => {
    const stepsText = tip.steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    const fullText = `${tip.title}\n\n${tip.description}\n\nPassos para resolver:\n${stepsText}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Passos copiados para a área de transferência',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar para a área de transferência',
        variant: 'destructive',
      });
    }
  };

  const handleQuickAction = () => {
    if (tip.quickAction) {
      navigate(tip.quickAction.route);
    }
  };

  return (
    <div 
      className={cn(
        'rounded-lg border transition-all duration-200',
        isExpanded ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-muted/30 border-border',
        className
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="font-medium text-sm">Como resolver este erro</span>
          <Badge variant={getSeverityBadgeVariant(tip.severity)} className="text-xs">
            {tip.severity === 'critical' ? 'Crítico' : 
             tip.severity === 'high' ? 'Alto' :
             tip.severity === 'medium' ? 'Médio' : 'Baixo'}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content - Expandable */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Description */}
          <p className="text-sm text-muted-foreground pl-9">
            {tip.description}
          </p>

          {/* Steps */}
          <div className="pl-9">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              Passos para resolver:
              <Badge variant="outline" className="text-xs">
                {tip.category}
              </Badge>
            </h4>
            <ol className="space-y-1.5">
              {tip.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pl-9 pt-2">
            {tip.quickAction && (
              <Button size="sm" onClick={handleQuickAction} className="gap-1">
                <ArrowRight className="h-3.5 w-3.5" />
                {tip.quickAction.label}
              </Button>
            )}
            
            <Button size="sm" variant="outline" onClick={handleCopySteps} className="gap-1">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar passos
                </>
              )}
            </Button>

            {tip.documentationUrl && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => window.open(tip.documentationUrl, '_blank')}
                className="gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Documentação
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
