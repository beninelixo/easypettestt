import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ProfileSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-6 animate-fade-in", className)}>
    {/* Header with avatar */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full shimmer-effect" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-48 shimmer-effect" />
        <Skeleton className="h-4 w-32 shimmer-effect" />
        <Skeleton className="h-4 w-64 shimmer-effect" />
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-8 w-full shimmer-effect" />
          <Skeleton className="h-4 w-16 mx-auto shimmer-effect" />
        </div>
      ))}
    </div>

    {/* Content sections */}
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32 shimmer-effect" />
          <Skeleton className="h-20 w-full rounded-lg shimmer-effect" />
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-6 animate-fade-in", className)}>
    {/* Page header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64 shimmer-effect" />
      <Skeleton className="h-4 w-96 shimmer-effect" />
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="space-y-3 p-6 rounded-xl border bg-card"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 shimmer-effect" />
            <Skeleton className="h-10 w-10 rounded-lg shimmer-effect" />
          </div>
          <Skeleton className="h-8 w-20 shimmer-effect" />
          <Skeleton className="h-3 w-16 shimmer-effect" />
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="space-y-4 p-6 rounded-xl border bg-card">
          <Skeleton className="h-6 w-32 shimmer-effect" />
          <Skeleton className="h-64 w-full rounded-lg shimmer-effect" />
        </div>
      ))}
    </div>
  </div>
);

export const ListSkeleton = ({ 
  items = 5, 
  className 
}: { 
  items?: number; 
  className?: string;
}) => (
  <div className={cn("space-y-3 animate-fade-in", className)}>
    {[...Array(items)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 rounded-lg border bg-card"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <Skeleton className="h-12 w-12 rounded-lg shimmer-effect" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4 shimmer-effect" />
          <Skeleton className="h-4 w-1/2 shimmer-effect" />
        </div>
        <Skeleton className="h-9 w-20 rounded-md shimmer-effect" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number; 
  columns?: number;
  className?: string;
}) => (
  <div className={cn("space-y-4 animate-fade-in", className)}>
    {/* Table header */}
    <div className="flex items-center gap-4 p-4 border-b">
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={i} className="h-5 flex-1 shimmer-effect" />
      ))}
    </div>

    {/* Table rows */}
    {[...Array(rows)].map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="flex items-center gap-4 p-4"
        style={{ animationDelay: `${rowIndex * 60}ms` }}
      >
        {[...Array(columns)].map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            className="h-4 flex-1 shimmer-effect"
          />
        ))}
      </div>
    ))}
  </div>
);

export const GridSkeleton = ({ 
  items = 6, 
  columns = 3,
  className 
}: { 
  items?: number; 
  columns?: number;
  className?: string;
}) => (
  <div
    className={cn(
      "grid gap-6 animate-fade-in",
      columns === 2 && "grid-cols-1 md:grid-cols-2",
      columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      className
    )}
  >
    {[...Array(items)].map((_, i) => (
      <div
        key={i}
        className="space-y-4 p-6 rounded-xl border bg-card"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <Skeleton className="h-48 w-full rounded-lg shimmer-effect" />
        <Skeleton className="h-6 w-3/4 shimmer-effect" />
        <Skeleton className="h-4 w-full shimmer-effect" />
        <Skeleton className="h-4 w-5/6 shimmer-effect" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1 rounded-md shimmer-effect" />
          <Skeleton className="h-9 w-9 rounded-md shimmer-effect" />
        </div>
      </div>
    ))}
  </div>
);

export const FormSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-6 animate-fade-in", className)}>
    <Skeleton className="h-8 w-48 shimmer-effect" />
    
    {[...Array(4)].map((_, i) => (
      <div key={i} className="space-y-2" style={{ animationDelay: `${i * 80}ms` }}>
        <Skeleton className="h-5 w-24 shimmer-effect" />
        <Skeleton className="h-10 w-full rounded-md shimmer-effect" />
      </div>
    ))}

    <div className="flex gap-3 pt-4">
      <Skeleton className="h-10 w-24 rounded-md shimmer-effect" />
      <Skeleton className="h-10 w-24 rounded-md shimmer-effect" />
    </div>
  </div>
);

export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("space-y-4 p-6 rounded-xl border bg-card animate-fade-in", className)}>
    <div className="flex items-start justify-between">
      <Skeleton className="h-6 w-32 shimmer-effect" />
      <Skeleton className="h-8 w-8 rounded-md shimmer-effect" />
    </div>
    <Skeleton className="h-24 w-full rounded-lg shimmer-effect" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full shimmer-effect" />
      <Skeleton className="h-4 w-3/4 shimmer-effect" />
    </div>
  </div>
);
