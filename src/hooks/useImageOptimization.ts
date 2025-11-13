import { useState, useEffect } from 'react';

interface ImageOptimizationOptions {
  src: string;
  maxWidth?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Hook to optimize images by converting to WebP and resizing
 * Reduces bandwidth and improves loading performance
 */
export function useImageOptimization({
  src,
  maxWidth = 1920,
  quality = 0.8,
  format = 'webp'
}: ImageOptimizationOptions) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    // Skip optimization for already optimized images
    if (src.includes('.webp') || src.includes('optimized')) {
      setOptimizedSrc(src);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const optimizeImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create an image element to load the source
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });

        if (isCancelled) return;

        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Create canvas for optimization
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized format
        const mimeType = `image/${format}`;
        const optimized = canvas.toBlob(
          (blob) => {
            if (isCancelled || !blob) return;

            const optimizedUrl = URL.createObjectURL(blob);
            setOptimizedSrc(optimizedUrl);
            setIsLoading(false);
          },
          mimeType,
          quality
        );

      } catch (err) {
        console.error('Image optimization failed:', err);
        setError(err instanceof Error ? err.message : 'Optimization failed');
        setOptimizedSrc(src); // Fallback to original
        setIsLoading(false);
      }
    };

    optimizeImage();

    // Cleanup
    return () => {
      isCancelled = true;
      if (optimizedSrc !== src && optimizedSrc.startsWith('blob:')) {
        URL.revokeObjectURL(optimizedSrc);
      }
    };
  }, [src, maxWidth, quality, format]);

  return { optimizedSrc, isLoading, error };
}
