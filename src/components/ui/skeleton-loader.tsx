import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CardSkeleton = () => (
  <Card className="animate-fade-in">
    <CardHeader>
      <Skeleton className="h-8 w-3/4 shimmer-effect" />
      <Skeleton className="h-4 w-1/2 shimmer-effect" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full shimmer-effect" />
      <Skeleton className="h-4 w-5/6 shimmer-effect" />
      <Skeleton className="h-4 w-4/6 shimmer-effect" />
    </CardContent>
  </Card>
);

export const StatCardSkeleton = () => (
  <Card className="animate-fade-in">
    <CardContent className="pt-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 shimmer-effect" />
        <Skeleton className="h-10 w-32 shimmer-effect" />
        <Skeleton className="h-3 w-20 shimmer-effect" />
      </div>
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3 animate-fade-in">
    <Skeleton className="h-10 w-full shimmer-effect" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton 
        key={i} 
        className="h-16 w-full shimmer-effect" 
        style={{ animationDelay: `${i * 80}ms` }}
      />
    ))}
  </div>
);

export const ListSkeleton = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-4 animate-fade-in">
    {Array.from({ length: items }).map((_, i) => (
      <div 
        key={i} 
        className="flex items-center space-x-4"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <Skeleton className="h-12 w-12 rounded-full shimmer-effect" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4 shimmer-effect" />
          <Skeleton className="h-3 w-1/2 shimmer-effect" />
        </div>
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24 shimmer-effect" />
      <Skeleton className="h-10 w-full shimmer-effect" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32 shimmer-effect" />
      <Skeleton className="h-10 w-full shimmer-effect" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-28 shimmer-effect" />
      <Skeleton className="h-24 w-full shimmer-effect" />
    </div>
    <Skeleton className="h-10 w-32 shimmer-effect" />
  </div>
);
