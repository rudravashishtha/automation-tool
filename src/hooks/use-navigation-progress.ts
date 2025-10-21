"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export function useNavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const navigateWithProgress = useCallback((href: string) => {
    setIsNavigating(true);
    
    // Add a small delay to show the loading state
    setTimeout(() => {
      router.push(href);
      // Reset after navigation
      setTimeout(() => setIsNavigating(false), 100);
    }, 100);
  }, [router]);

  return {
    isNavigating,
    navigateWithProgress,
  };
}