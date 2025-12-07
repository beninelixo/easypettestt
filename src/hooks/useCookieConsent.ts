import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  consented: boolean;
  consentDate: string | null;
}

const COOKIE_CONSENT_KEY = 'easypet_cookie_consent';

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  consented: false,
  consentDate: null,
};

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
        setShowBanner(!parsed.consented);
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: CookiePreferences) => {
    const prefsToSave = {
      ...newPrefs,
      essential: true, // Always true
      consented: true,
      consentDate: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefsToSave));
    setPreferences(prefsToSave);
    setShowBanner(false);
  }, []);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      consented: true,
      consentDate: new Date().toISOString(),
    });
  }, [savePreferences]);

  // Reject optional cookies (only essential)
  const rejectOptional = useCallback(() => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      consented: true,
      consentDate: new Date().toISOString(),
    });
  }, [savePreferences]);

  // Update specific preference
  const updatePreference = useCallback((key: keyof Omit<CookiePreferences, 'essential' | 'consented' | 'consentDate'>, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Save custom preferences
  const saveCustomPreferences = useCallback(() => {
    savePreferences(preferences);
  }, [preferences, savePreferences]);

  // Reset consent (for testing or user request)
  const resetConsent = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setPreferences(defaultPreferences);
    setShowBanner(true);
  }, []);

  return {
    preferences,
    showBanner,
    acceptAll,
    rejectOptional,
    updatePreference,
    saveCustomPreferences,
    resetConsent,
    setShowBanner,
  };
}
