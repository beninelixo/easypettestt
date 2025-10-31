import { useState, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export const useRateLimit = (key: string, config: RateLimitConfig) => {
  const [attempts, setAttempts] = useState<number>(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  const isBlocked = useCallback(() => {
    if (!blockedUntil) return false;
    if (Date.now() > blockedUntil) {
      setBlockedUntil(null);
      setAttempts(0);
      return false;
    }
    return true;
  }, [blockedUntil]);

  const checkLimit = useCallback(() => {
    if (isBlocked()) {
      const remainingTime = Math.ceil((blockedUntil! - Date.now()) / 1000);
      return {
        allowed: false,
        remainingTime,
        message: `Muitas tentativas. Aguarde ${remainingTime}s.`
      };
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= config.maxAttempts) {
      const blockUntil = Date.now() + config.blockDurationMs;
      setBlockedUntil(blockUntil);
      return {
        allowed: false,
        remainingTime: config.blockDurationMs / 1000,
        message: `Muitas tentativas. Bloqueado por ${config.blockDurationMs / 1000}s.`
      };
    }

    // Auto-reset after window
    setTimeout(() => {
      setAttempts(prev => Math.max(0, prev - 1));
    }, config.windowMs);

    return { allowed: true, remainingTime: 0, message: '' };
  }, [attempts, blockedUntil, config, isBlocked]);

  const reset = useCallback(() => {
    setAttempts(0);
    setBlockedUntil(null);
  }, []);

  return { checkLimit, reset, isBlocked: isBlocked() };
};
