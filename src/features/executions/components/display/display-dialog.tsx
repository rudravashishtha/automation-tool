"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { DISPLAY_EXECUTION_CHANNEL_NAME } from "@/inngest/channels/display";
import { fetchDisplayRealtimeToken } from "./actions";

interface DisplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
}

export function DisplayDialog({
  open,
  onOpenChange,
  nodeId,
}: DisplayDialogProps) {
  const { data } = useInngestSubscription({
    refreshToken: fetchDisplayRealtimeToken,
    enabled: true,
  });

  const latest = useMemo(() => {
    if (!data?.length) return undefined;
    return data
      .filter(
        (msg) =>
          msg.kind === "data" &&
          msg.channel === DISPLAY_EXECUTION_CHANNEL_NAME &&
          msg.topic === "status" &&
          msg.data.nodeId === nodeId
      )
      .sort((a, b) => {
        if (a.kind === "data" && b.kind === "data") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return 0;
      })[0];
  }, [data, nodeId]);

  const payload = latest?.kind === "data" ? latest.data : undefined;
  const pretty = useMemo(() => {
    const v = payload?.displayData ?? null;
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  }, [payload]);

  const canCopy = Boolean(pretty);

  const handleCopy = async () => {
    if (!pretty) return;
    try {
      await navigator.clipboard.writeText(pretty);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-full">
        <DialogHeader>
          <DialogTitle>Data from previous nodes</DialogTitle>
          <DialogDescription>
            Read-only output. Passed through unchanged.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Node ID: {nodeId}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={!canCopy}
            >
              Copy JSON
            </Button>
          </div>
          <div className="overflow-auto bg-muted">
            <pre className="rounded-md p-3 max-h-[400px] text-sm font-mono max-w-full">
              {pretty || "No data available"}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
