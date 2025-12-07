import { useCallback, useEffect } from 'react';

interface SmoothScrollOptions {
  offset?: number;
  duration?: number;
  easing?: 'ease-out' | 'ease-in-out' | 'cubic-bezier';
}

export function useSmoothScroll(options: SmoothScrollOptions = {}) {
  const { offset = 80, duration = 800 } = options;

  const scrollTo = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }, [offset]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Add scroll progress tracking
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.hash) {
        e.preventDefault();
        const id = target.hash.replace('#', '');
        scrollTo(id);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [scrollTo]);

  return { scrollTo, scrollToTop };
}

export default useSmoothScroll;
