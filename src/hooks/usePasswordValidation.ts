import { useState, useEffect } from 'react';

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  feedback: string[];
  isValid: boolean;
}

const PASSWORD_MIN_LENGTH = 10;

export function usePasswordValidation(password: string): PasswordStrength {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Muito Fraca',
    color: 'bg-red-500',
    isValid: false,
    feedback: []
  });

  useEffect(() => {
    const feedback: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length === 0) {
      setStrength({
        score: 0,
        label: 'Digite uma senha',
        color: 'bg-gray-300',
        isValid: false,
        feedback: [`Mínimo ${PASSWORD_MIN_LENGTH} caracteres necessário`]
      });
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      feedback.push(`Mínimo ${PASSWORD_MIN_LENGTH} caracteres (faltam ${PASSWORD_MIN_LENGTH - password.length})`);
    } else {
      score += 1;
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
      feedback.push('Adicione pelo menos uma letra MAIÚSCULA');
    } else {
      score += 1;
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
      feedback.push('Adicione pelo menos uma letra minúscula');
    } else {
      score += 1;
    }

    // Check for numbers
    if (!/\d/.test(password)) {
      feedback.push('Adicione pelo menos um número');
    } else {
      score += 1;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Adicione pelo menos um caractere especial (!@#$%^&*...)');
    } else {
      score += 1;
    }

    // Determine label and color based on score
    let label = 'Muito Fraca';
    let color = 'bg-red-500';

    if (score === 5) {
      label = 'Muito Forte';
      color = 'bg-green-500';
    } else if (score === 4) {
      label = 'Forte';
      color = 'bg-green-400';
    } else if (score === 3) {
      label = 'Média';
      color = 'bg-yellow-500';
    } else if (score === 2) {
      label = 'Fraca';
      color = 'bg-orange-500';
    }

    const isValid = password.length >= PASSWORD_MIN_LENGTH && 
                    /[A-Z]/.test(password) && 
                    /[a-z]/.test(password) && 
                    /\d/.test(password) && 
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    setStrength({
      score,
      label,
      color,
      isValid,
      feedback: feedback.length > 0 ? feedback : ['Senha forte! ✓']
    });
  }, [password]);

  return strength;
}
