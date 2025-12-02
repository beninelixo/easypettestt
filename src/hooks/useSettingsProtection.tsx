import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = 'easypet_settings_unlocked';

export const useSettingsProtection = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  // Listen for storage changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      setIsUnlocked(sessionStorage.getItem(STORAGE_KEY) === 'true');
    };

    // Check on mount and when storage changes
    handleStorageChange();
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll periodically for same-tab changes
    const interval = setInterval(handleStorageChange, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const unlock = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setIsUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
  }, []);

  return {
    isUnlocked,
    unlock,
    lock,
  };
};
