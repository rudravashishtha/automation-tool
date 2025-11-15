"use client";

import React, { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyIcon, MoveRightIcon } from "lucide-react";

interface StripeTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({
  open,
  onOpenChange,
}: StripeTriggerDialogProps) => {
  const params = useParams();
  const workflowId = (params?.workflowId ?? "") as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookUrl = useMemo(
    () =>
      `${baseUrl.replace(
        /\/$/,
        ""
      )}/api/webhooks/stripe?workflowId=${encodeURIComponent(workflowId)}`,
    [baseUrl, workflowId]
  );

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (!navigator?.clipboard?.writeText) {
          toast.error("Clipboard not supported in this browser.");
          return false;
        }
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const handleCopyWebhook = useCallback(async () => {
    const success = await copyToClipboard(webhookUrl);
    if (success) {
      toast.success("Webhook URL copied!");
    } else {
      toast.error("Failed to copy webhook URL.");
    }
  }, [copyToClipboard, webhookUrl]);

  const InlineRightIcon = () => (
    <MoveRightIcon className="inline-block" size={16} />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Stripe Dashboard to trigger this
            workflow on payment events.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-2">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
                aria-label="Webhook URL"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyWebhook}
                aria-label="Copy webhook URL"
              >
                <CopyIcon size={16} />
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Stripe Dashboard</li>
              <li>
                Go to Developers <InlineRightIcon /> Webhooks
              </li>
              <li>Click "Add Endpoint"</li>
              <li>Paste the webhook URL above</li>
              <li>Select events to listen (e.g., payment_intent.succeeded)</li>
              <li>Copy and save the signing secret</li>
            </ol>
          </div>
        </div>
      </DialogContent>
  </Dialog>
  );
};
