import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string | null;
  onSuccess?: () => void;
}

export function RatingDialog({ open, onOpenChange, appointmentId, onSuccess }: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!appointmentId || rating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('satisfaction_surveys')
        .insert({
          appointment_id: appointmentId,
          client_id: session.session.user.id,
          rating,
          feedback: feedback.trim() || null,
          would_recommend: wouldRecommend,
        });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "✅ Avaliação enviada",
        description: "Obrigado pelo seu feedback! Sua opinião é muito importante.",
      });

      setTimeout(() => {
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      }, 1500);

    } catch (error) {
      console.error('Rating error:', error);
      toast({
        title: "Erro ao enviar avaliação",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setFeedback('');
    setWouldRecommend(null);
    setSuccess(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Avalie o Serviço</DialogTitle>
          <DialogDescription>
            Sua avaliação ajuda outros clientes e melhora nossos serviços
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" aria-hidden="true" />
            </div>
            <p className="text-lg font-semibold text-green-600">Obrigado pela avaliação!</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nota do serviço *</Label>
              <div 
                className="flex items-center justify-center gap-2 py-2"
                role="radiogroup"
                aria-label="Avaliação de 1 a 5 estrelas"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={cn(
                      "p-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded",
                      "hover:scale-125 active:scale-95"
                    )}
                    aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                    aria-checked={rating === star}
                    role="radio"
                  >
                    <Star
                      className={cn(
                        "h-10 w-10 transition-colors",
                        star <= displayRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/40"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 1 && "Muito ruim"}
                  {rating === 2 && "Ruim"}
                  {rating === 3 && "Regular"}
                  {rating === 4 && "Bom"}
                  {rating === 5 && "Excelente!"}
                </p>
              )}
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-sm font-medium">
                Comentário (opcional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Conte-nos sobre sua experiência..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {feedback.length}/500
              </p>
            </div>

            {/* Would Recommend */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Você recomendaria este serviço?</Label>
              <div className="flex gap-3" role="radiogroup" aria-label="Você recomendaria?">
                <Button
                  type="button"
                  variant={wouldRecommend === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWouldRecommend(true)}
                  className="flex-1"
                  role="radio"
                  aria-checked={wouldRecommend === true}
                >
                  Sim, recomendo!
                </Button>
                <Button
                  type="button"
                  variant={wouldRecommend === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setWouldRecommend(false)}
                  className="flex-1"
                  role="radio"
                  aria-checked={wouldRecommend === false}
                >
                  Não recomendo
                </Button>
              </div>
            </div>
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Enviando...
                </>
              ) : (
                'Enviar Avaliação'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
