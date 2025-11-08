import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useTheme } from '@/hooks/useTheme';

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
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error('VITE_HCAPTCHA_SITE_KEY não configurada');
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive">
          ⚠️ CAPTCHA não configurado. Configure VITE_HCAPTCHA_SITE_KEY no .env
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        sitekey={siteKey}
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
