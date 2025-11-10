import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  variant?: "circular" | "linear" | "dots";
  size?: "sm" | "md" | "lg";
  progress?: number;
  className?: string;
  label?: string;
}

export const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ variant = "circular", size = "md", progress, className, label }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12",
    };

    if (variant === "circular") {
      return (
        <div ref={ref} className={cn("flex flex-col items-center gap-2", className)}>
          {progress !== undefined ? (
            <div className="relative">
              <svg
                className={cn(sizeClasses[size], "animate-spin")}
                viewBox="0 0 50 50"
              >
                <circle
                  className="stroke-muted"
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  strokeWidth="4"
                />
                <circle
                  className="stroke-primary transition-all duration-300"
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  strokeWidth="4"
                  strokeDasharray={`${progress * 1.26} 126`}
                  strokeLinecap="round"
                  transform="rotate(-90 25 25)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
          ) : (
            <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
          )}
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
        </div>
      );
    }

    if (variant === "linear") {
      return (
        <div ref={ref} className={cn("w-full space-y-2", className)}>
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
              style={{ width: progress !== undefined ? `${progress}%` : "100%" }}
            >
              {progress === undefined && (
                <div className="h-full w-full animate-shimmer" />
              )}
            </div>
          </div>
          {progress !== undefined && (
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          )}
        </div>
      );
    }

    // Dots variant
    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)}>
        {label && <span className="text-sm text-muted-foreground mr-2">{label}</span>}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-primary",
                size === "sm" && "h-1.5 w-1.5",
                size === "md" && "h-2 w-2",
                size === "lg" && "h-3 w-3"
              )}
              style={{
                animation: `bounce-subtle 1.4s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);

ProgressIndicator.displayName = "ProgressIndicator";
