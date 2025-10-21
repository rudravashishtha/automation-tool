"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(loading && "cursor-not-allowed", className)}
      {...props}
    >
      {loading && <Loader2Icon className="size-4 animate-spin" />}
      {loading ? loadingText || children : children}
    </Button>
  );
}