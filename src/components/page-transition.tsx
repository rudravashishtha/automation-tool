"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { EnhancedLoadingView } from "./enhanced-loading-view";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (isTransitioning) {
    return (
      <EnhancedLoadingView 
        message="Loading page..." 
        showProgress={true}
        duration={300}
      />
    );
  }

  return <>{children}</>;
}