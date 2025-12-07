import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Shield, BarChart3, Megaphone, X, Settings } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { cn } from '@/lib/utils';

export function CookieConsentBanner() {
  const {
    preferences,
    showBanner,
    acceptAll,
    rejectOptional,
    updatePreference,
    saveCustomPreferences,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-t border-border shadow-2xl animate-in slide-in-from-bottom-5 duration-500"
      role="dialog"
      aria-label="Configurações de cookies"
      aria-describedby="cookie-description"
    >
      <div className="container mx-auto max-w-4xl">
        {!showDetails ? (
          /* Simple Banner View */
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p id="cookie-description" className="text-sm text-foreground">
                  Usamos cookies para melhorar sua experiência. Cookies essenciais são necessários para o funcionamento do site. 
                  Você pode personalizar suas preferências ou aceitar todos.
                </p>
                <a 
                  href="/privacy-policy#cookies" 
                  className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label="Ver política de privacidade sobre cookies"
                >
                  Saiba mais na nossa Política de Privacidade
                </a>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="flex-1 sm:flex-none"
                aria-label="Personalizar preferências de cookies"
              >
                <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                Personalizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectOptional}
                className="flex-1 sm:flex-none"
                aria-label="Rejeitar cookies opcionais"
              >
                Apenas Essenciais
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="flex-1 sm:flex-none"
                aria-label="Aceitar todos os cookies"
              >
                Aceitar Todos
              </Button>
            </div>
          </div>
        ) : (
          /* Detailed Settings View */
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-4 px-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle className="text-lg">Preferências de Cookies</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(false)}
                  aria-label="Fechar configurações de cookies"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Personalize quais cookies você permite. Cookies essenciais não podem ser desativados.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 px-0">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" aria-hidden="true" />
                  <div>
                    <Label className="font-medium">Cookies Essenciais</Label>
                    <p className="text-sm text-muted-foreground">
                      Necessários para o funcionamento do site. Incluem autenticação, segurança e preferências básicas.
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={true} 
                  disabled 
                  aria-label="Cookies essenciais (sempre ativados)"
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" aria-hidden="true" />
                  <div>
                    <Label htmlFor="analytics-switch" className="font-medium cursor-pointer">
                      Cookies Analíticos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Nos ajudam a entender como você usa o site para melhorar a experiência. (Google Analytics)
                    </p>
                  </div>
                </div>
                <Switch 
                  id="analytics-switch"
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => updatePreference('analytics', checked)}
                  aria-label="Ativar ou desativar cookies analíticos"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-start gap-3">
                  <Megaphone className="h-5 w-5 text-orange-600 mt-0.5" aria-hidden="true" />
                  <div>
                    <Label htmlFor="marketing-switch" className="font-medium cursor-pointer">
                      Cookies de Marketing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Usados para personalizar anúncios e medir eficácia de campanhas publicitárias.
                    </p>
                  </div>
                </div>
                <Switch 
                  id="marketing-switch"
                  checked={preferences.marketing} 
                  onCheckedChange={(checked) => updatePreference('marketing', checked)}
                  aria-label="Ativar ou desativar cookies de marketing"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={rejectOptional}
                  className="flex-1 sm:flex-none"
                  aria-label="Rejeitar todos os cookies opcionais"
                >
                  Rejeitar Opcionais
                </Button>
                <Button
                  variant="outline"
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none"
                  aria-label="Aceitar todos os cookies"
                >
                  Aceitar Todos
                </Button>
                <Button
                  onClick={saveCustomPreferences}
                  className="flex-1 sm:flex-none"
                  aria-label="Salvar preferências personalizadas de cookies"
                >
                  Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CookieConsentBanner;
