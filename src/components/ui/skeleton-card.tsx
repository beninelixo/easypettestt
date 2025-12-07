import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  variant?: 'default' | 'stat' | 'list' | 'profile' | 'appointment';
  className?: string;
}

export function SkeletonCard({ variant = 'default', className }: SkeletonCardProps) {
  const baseClasses = "animate-pulse rounded-lg bg-muted";
  
  switch (variant) {
    case 'stat':
      return (
        <div className={cn(baseClasses, "p-6 space-y-3", className)}>
          <div className="h-4 w-1/3 bg-muted-foreground/10 rounded" />
          <div className="h-8 w-1/2 bg-muted-foreground/10 rounded" />
          <div className="h-3 w-2/3 bg-muted-foreground/10 rounded" />
        </div>
      );
    
    case 'list':
      return (
        <div className={cn(baseClasses, "p-4 space-y-4", className)}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-muted-foreground/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted-foreground/10 rounded" />
                <div className="h-3 w-1/2 bg-muted-foreground/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      );
    
    case 'profile':
      return (
        <div className={cn(baseClasses, "p-6 space-y-4", className)}>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-muted-foreground/10" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-1/3 bg-muted-foreground/10 rounded" />
              <div className="h-4 w-1/2 bg-muted-foreground/10 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted-foreground/10 rounded" />
            <div className="h-4 w-5/6 bg-muted-foreground/10 rounded" />
            <div className="h-4 w-4/6 bg-muted-foreground/10 rounded" />
          </div>
        </div>
      );
    
    case 'appointment':
      return (
        <div className={cn(baseClasses, "p-4 space-y-3", className)}>
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-2/3 bg-muted-foreground/10 rounded" />
              <div className="h-3 w-1/2 bg-muted-foreground/10 rounded" />
            </div>
            <div className="h-6 w-16 bg-muted-foreground/10 rounded-full" />
          </div>
          <div className="flex space-x-2">
            <div className="h-3 w-20 bg-muted-foreground/10 rounded" />
            <div className="h-3 w-16 bg-muted-foreground/10 rounded" />
          </div>
        </div>
      );
    
    default:
      return (
        <div className={cn(baseClasses, "p-6 space-y-4", className)}>
          <div className="h-4 w-3/4 bg-muted-foreground/10 rounded" />
          <div className="h-4 w-full bg-muted-foreground/10 rounded" />
          <div className="h-4 w-5/6 bg-muted-foreground/10 rounded" />
          <div className="h-10 w-1/3 bg-muted-foreground/10 rounded mt-4" />
        </div>
      );
  }
}

export default SkeletonCard;
