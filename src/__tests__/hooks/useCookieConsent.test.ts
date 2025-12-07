import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

describe('useCookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should show banner when no consent stored', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    expect(result.current.showBanner).toBe(true);
    expect(result.current.preferences.consented).toBe(false);
  });

  it('should not show banner when consent already stored', () => {
    const storedConsent = JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      consented: true,
      consentDate: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(localStorage.getItem).mockReturnValue(storedConsent);
    
    const { result } = renderHook(() => useCookieConsent());
    
    expect(result.current.showBanner).toBe(false);
    expect(result.current.preferences.consented).toBe(true);
  });

  it('should accept all cookies correctly', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    act(() => {
      result.current.acceptAll();
    });
    
    expect(result.current.preferences.essential).toBe(true);
    expect(result.current.preferences.analytics).toBe(true);
    expect(result.current.preferences.marketing).toBe(true);
    expect(result.current.preferences.consented).toBe(true);
    expect(result.current.showBanner).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should reject optional cookies correctly', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    act(() => {
      result.current.rejectOptional();
    });
    
    expect(result.current.preferences.essential).toBe(true);
    expect(result.current.preferences.analytics).toBe(false);
    expect(result.current.preferences.marketing).toBe(false);
    expect(result.current.preferences.consented).toBe(true);
    expect(result.current.showBanner).toBe(false);
  });

  it('should update individual preferences', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    act(() => {
      result.current.updatePreference('analytics', true);
    });
    
    expect(result.current.preferences.analytics).toBe(true);
    expect(result.current.preferences.marketing).toBe(false);
  });

  it('should save custom preferences', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    act(() => {
      result.current.updatePreference('analytics', true);
      result.current.updatePreference('marketing', false);
    });
    
    act(() => {
      result.current.saveCustomPreferences();
    });
    
    expect(result.current.preferences.consented).toBe(true);
    expect(result.current.showBanner).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should reset consent correctly', () => {
    const storedConsent = JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      consented: true,
      consentDate: '2024-01-01T00:00:00.000Z',
    });
    vi.mocked(localStorage.getItem).mockReturnValue(storedConsent);
    
    const { result } = renderHook(() => useCookieConsent());
    
    act(() => {
      result.current.resetConsent();
    });
    
    expect(result.current.showBanner).toBe(true);
    expect(result.current.preferences.consented).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalled();
  });

  it('should always keep essential cookies enabled', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    // Even after rejecting, essential should be true
    act(() => {
      result.current.rejectOptional();
    });
    
    expect(result.current.preferences.essential).toBe(true);
  });

  it('should store consent date', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useCookieConsent());
    
    act(() => {
      result.current.acceptAll();
    });
    
    expect(result.current.preferences.consentDate).not.toBeNull();
    expect(new Date(result.current.preferences.consentDate!).getTime()).toBeGreaterThan(0);
  });
});
