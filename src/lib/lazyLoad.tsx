import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';

/**
 * Enhanced lazy loading with retry logic and better error handling
 * Automatically retries failed chunk loads up to 3 times before failing
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName: string = 'Component'
): LazyExoticComponent<T> {
  return lazy(async () => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        return await componentImport();
      } catch (error) {
        console.error(`Failed to load ${componentName}, attempt ${i + 1}/${MAX_RETRIES}:`, error);
        
        // On last retry, throw the error
        if (i === MAX_RETRIES - 1) {
          throw new Error(`Failed to load ${componentName} after ${MAX_RETRIES} attempts`);
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
      }
    }

    // This should never be reached, but TypeScript requires a return
    throw new Error(`Failed to load ${componentName}`);
  });
}

/**
 * Preload a lazy-loaded component
 * Useful for preloading components that will be needed soon
 */
export function preloadComponent<T extends ComponentType<any>>(
  lazyComponent: LazyExoticComponent<T>
): Promise<{ default: T }> {
  // @ts-ignore - _ctor is internal React property for lazy components
  return lazyComponent._init(lazyComponent._payload);
}
