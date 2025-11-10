import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useTheme } from '@/hooks/useTheme';
import { HCAPTCHA_SITE_KEY } from '@/config/captcha';

interface CaptchaWrapperProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  size?: 'normal' | 'compact' | 'invisible';
}

export const CaptchaWrapper = ({ 
  onVerify, 
  onExpire,
  onError,
  size = 'normal' 
}: CaptchaWrapperProps) => {
  const { theme } = useTheme();

  // Validação mais rigorosa do Site Key
  if (!HCAPTCHA_SITE_KEY || HCAPTCHA_SITE_KEY.length < 30) {
    console.error('❌ HCAPTCHA_SITE_KEY inválida ou não configurada:', {
      exists: !!HCAPTCHA_SITE_KEY,
      length: HCAPTCHA_SITE_KEY?.length || 0,
      preview: HCAPTCHA_SITE_KEY ? HCAPTCHA_SITE_KEY.substring(0, 10) + '...' : 'undefined'
    });
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
        <p className="text-sm text-destructive font-semibold">
          ⚠️ CAPTCHA não configurado corretamente
        </p>
        <p className="text-xs text-muted-foreground">
          Entre em contato com o administrador do sistema.
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          Site Key: {HCAPTCHA_SITE_KEY ? 'Inválida' : 'Não encontrada'}
        </p>
      </div>
    );
  }

  console.log('✅ CAPTCHA configurado:', {
    siteKeyLength: HCAPTCHA_SITE_KEY.length,
    siteKeyPrefix: HCAPTCHA_SITE_KEY.substring(0, 15) + '...',
    theme,
    size
  });

  return (
    <div className="flex justify-center">
      <div className="relative p-2 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 hover:border-primary/40 transition-all duration-300">
        <HCaptcha
          sitekey={HCAPTCHA_SITE_KEY}
          onVerify={(token) => {
            console.log('✅ CAPTCHA verificado no frontend:', {
              tokenLength: token.length,
              tokenPrefix: token.substring(0, 20) + '...',
              timestamp: new Date().toISOString()
            });
            onVerify(token);
          }}
          onExpire={() => {
            console.log('⏰ CAPTCHA expirado - requer nova verificação');
            onExpire?.();
          }}
          onError={(err) => {
            console.error('❌ Erro no CAPTCHA:', {
              error: err,
              timestamp: new Date().toISOString()
            });
            onError?.(err);
          }}
          size={size}
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
          <span className="text-xs text-primary-foreground font-bold">✓</span>
        </div>
      </div>
    </div>
  );
};
