// Mobile Breakpoint Utilities - Centralized breakpoint constants and hooks
import { useState, useEffect, useCallback } from 'react';
import { debounce } from '@/lib/utils';

export const breakpoints = {
  xs: 320,   // Small mobiles
  sm: 640,   // Standard mobiles
  md: 768,   // Tablets portrait
  lg: 1024,  // Tablets landscape / small desktops
  xl: 1280,  // Medium desktops
  '2xl': 1536 // Large desktops
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Enhanced useIsMobile with debounce for performance
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoints.md);
    };

    const debouncedCheck = debounce(checkMobile, 150);

    // Initial check
    checkMobile();
    
    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
    };
  }, []);

  return isMobile;
};

// Hook to get current breakpoint
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');

  useEffect(() => {
    const getBreakpoint = (): Breakpoint => {
      const width = window.innerWidth;
      if (width >= breakpoints['2xl']) return '2xl';
      if (width >= breakpoints.xl) return 'xl';
      if (width >= breakpoints.lg) return 'lg';
      if (width >= breakpoints.md) return 'md';
      if (width >= breakpoints.sm) return 'sm';
      return 'xs';
    };

    const handleResize = debounce(() => {
      setBreakpoint(getBreakpoint());
    }, 150);

    // Initial check
    setBreakpoint(getBreakpoint());

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoint;
};

// Hook for checking if current breakpoint is at or above a certain size
export const useBreakpointUp = (target: Breakpoint) => {
  const [isAbove, setIsAbove] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      setIsAbove(window.innerWidth >= breakpoints[target]);
    };

    const debouncedCheck = debounce(checkBreakpoint, 150);
    checkBreakpoint();

    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
    };
  }, [target]);

  return isAbove;
};

// Hook for responsive value based on breakpoint
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const breakpoint = useBreakpoint();
  
  // Find the closest matching value for current breakpoint
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }
  
  return defaultValue;
}
