"use client";

import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Progress } from "./ui/progress";

interface EnhancedLoadingViewProps {
  message?: string;
  showProgress?: boolean;
  duration?: number;
}

export function EnhancedLoadingView({ 
  message, 
  showProgress = true,
  duration = 3000 
}: EnhancedLoadingViewProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, duration / 20);

    return () => clearInterval(interval);
  }, [showProgress, duration]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-y-6 h-full">
      <div className="flex flex-col items-center gap-y-4">
        <Loader2Icon className="size-8 animate-spin text-primary" />
        {message && (
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {message}
          </p>
        )}
      </div>
      
      {showProgress && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
}