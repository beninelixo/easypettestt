import { Skeleton } from "@/components/ui/skeleton";

export const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-background p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
