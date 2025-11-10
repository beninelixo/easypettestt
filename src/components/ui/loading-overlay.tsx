import * as React from "react";
import { cn } from "@/lib/utils";
import { ProgressIndicator } from "./progress-indicator";

interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  variant?: "circular" | "linear" | "dots";
  progress?: number;
  blur?: boolean;
  fullscreen?: boolean;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  label,
  variant = "circular",
  progress,
  blur = true,
  fullscreen = false,
  children,
}) => {
  if (!isLoading && !children) return null;

  return (
    <div className={cn(
      "relative",
      fullscreen && "fixed inset-0 z-50"
    )}>
      {children}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/80 z-10 animate-fade-in",
            blur && "backdrop-blur-sm",
            fullscreen && "fixed"
          )}
        >
          <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card border shadow-lg">
            <ProgressIndicator
              variant={variant}
              progress={progress}
              label={label}
              size="lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
