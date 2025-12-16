import { useEffect, useRef, useCallback } from 'react';

type EventMap = WindowEventMap & DocumentEventMap & HTMLElementEventMap;

/**
 * Hook for adding event listeners with automatic cleanup
 * Prevents memory leaks by properly removing listeners on unmount
 */
export function useEventListener<K extends keyof EventMap>(
  eventName: K,
  handler: (event: EventMap[K]) => void,
  element?: Window | Document | HTMLElement | null,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);

  // Update ref when handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Default to window if no element provided
    const targetElement = element ?? window;
    
    if (!targetElement?.addEventListener) {
      return;
    }

    const eventListener = (event: Event) => {
      savedHandler.current(event as EventMap[K]);
    };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Hook for handling window resize events with debouncing
 */
export function useWindowResize(
  handler: () => void,
  debounceMs: number = 150
): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedHandler = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handler, debounceMs);
  }, [handler, debounceMs]);

  useEventListener('resize', debouncedHandler);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyPress(
  targetKey: string,
  handler: (event: KeyboardEvent) => void,
  options?: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  }
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const matchesKey = event.key === targetKey || event.code === targetKey;
      const matchesCtrl = options?.ctrlKey ? event.ctrlKey : true;
      const matchesShift = options?.shiftKey ? event.shiftKey : true;
      const matchesAlt = options?.altKey ? event.altKey : true;
      const matchesMeta = options?.metaKey ? event.metaKey : true;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        handler(event);
      }
    },
    [targetKey, handler, options]
  );

  useEventListener('keydown', handleKeyDown);
}

/**
 * Hook for handling clicks outside an element
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
