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
import { generateGoogleFormScript } from "./utils";

interface GoogleFormTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({
  open,
  onOpenChange,
}: GoogleFormTriggerDialogProps) => {
  const params = useParams();
  const workflowId = (params?.workflowId ?? "") as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookUrl = useMemo(
    () =>
      `${baseUrl.replace(
        /\/$/,
        ""
      )}/api/webhooks/google-form?workflowId=${encodeURIComponent(workflowId)}`,
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

  const handleCopyScript = useCallback(async () => {
    const script = generateGoogleFormScript(webhookUrl);
    const success = await copyToClipboard(script);
    if (success) {
      toast.success("Google Apps Script copied!");
    } else {
      toast.error("Failed to copy script.");
    }
  }, [copyToClipboard, webhookUrl]);

  const InlineRightIcon = () => (
    <MoveRightIcon className="inline-block" size={16} />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* limit height & allow vertical scrolling when content overflows */}
      <DialogContent className="max-h-[80vh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form's Apps Script to trigger a
            workflow when the form is submitted.
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
              <li>Open your Google Form</li>
              <li>
                Click the three-dots menu <InlineRightIcon /> Apps Script
              </li>
              <li>Paste the script below</li>
              <li>
                Replace <code>WEBHOOK_URL</code> with the webhook URL above
              </li>
              <li>
                Save and then select <strong>Triggers</strong>{" "}
                <InlineRightIcon /> Add Trigger
              </li>
              <li>
                Choose: From form <InlineRightIcon /> On form submit{" "}
                <InlineRightIcon /> Save
              </li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="font-medium text-sm">Google Apps Script:</h4>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyScript}
              aria-label="Copy Google Apps Script"
            >
              <CopyIcon size={16} className="mr-2" /> Copy Google Apps Script
            </Button>
            <p className="text-xs text-muted-foreground">
              This script includes your webhook URL and handles form
              submissions.
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{googleForm.respondentEmail}}"}
                </code>{" "}
                - Respondent&apos;s email
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{googleForm.responses['Question Name']}}"}
                </code>{" "}
                - Specific Answer
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{json googleForm.responses}}"}
                </code>{" "}
                - All responses as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
