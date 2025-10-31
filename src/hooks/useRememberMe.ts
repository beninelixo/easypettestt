import { useState, useEffect } from 'react';

const REMEMBER_ME_KEY = 'bointhosa_remember_me';
const REMEMBER_EMAIL_KEY = 'bointhosa_saved_email';

export const useRememberMe = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');

  useEffect(() => {
    // Load remember me preference
    const remembered = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    setRememberMe(remembered);

    // Load saved email if remember me is enabled
    if (remembered) {
      const email = localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
      setSavedEmail(email);
    }
  }, []);

  const saveRememberMe = (remember: boolean, email?: string) => {
    setRememberMe(remember);
    
    if (remember && email) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      setSavedEmail(email);
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
      setSavedEmail('');
    }
  };

  const clearRemembered = () => {
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
    setRememberMe(false);
    setSavedEmail('');
  };

  return {
    rememberMe,
    savedEmail,
    saveRememberMe,
    clearRemembered,
  };
};
