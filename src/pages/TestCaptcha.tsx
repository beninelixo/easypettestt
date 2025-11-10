import { useState } from 'react';
import { CaptchaWrapper } from '@/components/auth/CaptchaWrapper';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HCAPTCHA_SITE_KEY } from '@/config/captcha';
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TestCaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCaptcha = async () => {
    if (!token) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Iniciando teste de CAPTCHA...');
      
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { captcha_token: token, action: 'test' }
      });
      
      console.log('📊 Resultado do teste:', { data, error });
      
      setResult({ data, error });
    } catch (error) {
      console.error('❌ Exceção ao testar CAPTCHA:', error);
      setResult({ error });
    }
    
    setLoading(false);
  };

  const resetTest = () => {
    setToken(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="p-8 max-w-2xl w-full space-y-6 shadow-xl">
        {/* Header */}
        <div className="space-y-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Login
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🧪 Teste de CAPTCHA
          </h1>
          <p className="text-muted-foreground">
            Página de diagnóstico para validar a configuração do hCaptcha
          </p>
        </div>

        {/* Site Key Info */}
        <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Site Key (Frontend):</p>
            {HCAPTCHA_SITE_KEY ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
          <p className="text-xs font-mono bg-background p-2 rounded border break-all">
            {HCAPTCHA_SITE_KEY || '❌ NÃO CONFIGURADA'}
          </p>
          {HCAPTCHA_SITE_KEY && (
            <p className="text-xs text-muted-foreground">
              ✅ Comprimento: {HCAPTCHA_SITE_KEY.length} caracteres
            </p>
          )}
        </div>

        {/* CAPTCHA Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">1. Complete o CAPTCHA</h2>
            {token && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
          
          <CaptchaWrapper
            onVerify={(t) => {
              setToken(t);
              setResult(null);
              console.log('✅ Token recebido:', {
                length: t.length,
                preview: t.substring(0, 30) + '...'
              });
            }}
            onExpire={() => {
              setToken(null);
              setResult(null);
              console.log('⏰ Token expirado');
            }}
            onError={(err) => {
              console.error('❌ Erro no CAPTCHA:', err);
              setResult({ error: err });
            }}
          />
        </div>

        {/* Token Display */}
        {token && (
          <div className="space-y-2 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Token CAPTCHA Gerado
            </p>
            <p className="text-xs font-mono bg-background p-2 rounded border break-all">
              {token}
            </p>
            <p className="text-xs text-muted-foreground">
              Comprimento: {token.length} caracteres
            </p>
          </div>
        )}

        {/* Test Button */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">2. Validar no Backend</h2>
          <div className="flex gap-2">
            <Button 
              onClick={testCaptcha} 
              disabled={!token || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Verificação Backend'
              )}
            </Button>
            
            {(token || result) && (
              <Button 
                onClick={resetTest} 
                variant="outline"
                disabled={loading}
              >
                Resetar
              </Button>
            )}
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">3. Resultado da Validação</h2>
            
            <div className={`p-4 rounded-lg border ${
              result.data?.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.data?.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ✅ CAPTCHA VÁLIDO
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <p className="font-semibold text-destructive">
                      ❌ CAPTCHA INVÁLIDO
                    </p>
                  </>
                )}
              </div>
              
              <pre className="text-xs overflow-auto bg-background p-3 rounded border max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {/* Troubleshooting Tips */}
            {!result.data?.success && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  💡 Dicas de Solução:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Verifique se <code className="bg-background px-1 rounded">HCAPTCHA_SECRET_KEY</code> está configurada nos Secrets</li>
                  <li>Confirme que Site Key e Secret Key são do mesmo projeto no hCaptcha</li>
                  <li>Verifique os logs da Edge Function <code className="bg-background px-1 rounded">verify-captcha</code></li>
                  <li>Certifique-se de que a Edge Function foi deployada</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
          <p className="font-semibold">Como usar esta página:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Complete o CAPTCHA acima</li>
            <li>Clique em "Testar Verificação Backend"</li>
            <li>Verifique se retorna "success: true"</li>
            <li>Se falhar, verifique os logs no console</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
