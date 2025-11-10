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

  if (!HCAPTCHA_SITE_KEY) {
    console.error('HCAPTCHA_SITE_KEY não configurada');
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive">
          ⚠️ CAPTCHA não configurado. Entre em contato com o suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        sitekey={HCAPTCHA_SITE_KEY}
        onVerify={onVerify}
        onExpire={() => {
          console.log('CAPTCHA expirado');
          onExpire?.();
        }}
        onError={(err) => {
          console.error('Erro no CAPTCHA:', err);
          onError?.(err);
        }}
        size={size}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};
