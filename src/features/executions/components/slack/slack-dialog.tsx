"use client";

import { useEffect } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, {
      message: "Variable Name is required.",
    })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and may contain only letters, numbers, and underscores.",
    }),
  webhookUrl: z.string().min(1, "Webhook URL is required."),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(2000, "Slack messages cannot exceed 2000 characters"),
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface SlackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
}

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: SlackDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      variableName: defaultValues.variableName || "",
      webhookUrl: defaultValues.webhookUrl || "",
      content: defaultValues.content || "",
    },
    resolver: zodResolver(formSchema),
  });

  // Reset form values when dialog opens with new defaults
  useEffect(() => {
    if (open)
      form.reset({
        variableName: defaultValues.variableName || "",
        webhookUrl: defaultValues.webhookUrl || "",
        content: defaultValues.content || "",
      });
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myResponse";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[min(90vw,640px)] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Slack Configuration</DialogTitle>
          <DialogDescription>
            Set up how this node sends messages to Slack using a webhook.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-[calc(85vh-6rem)]"
          >
            <div className="flex-1 overflow-y-auto space-y-8 mt-4 px-1">
              <FormField
                control={form.control}
                name="variableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Name</FormLabel>
                    <FormControl>
                      <Input placeholder="myResponse" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the response in subsequent
                      nodes: {`{{${watchVariableName}.generatedText}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://hooks.slack.com/triggers/..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Paste the webhook URL from your Slack Workspace. You can
                      create one from Worspace Settings → Integrations → Add
                      Automation → Choose an Event → From a webhook.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summary: {{myResponse.text}}"
                        className="min-h-[120px] max-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The content be sent to the Slack Channel by Bot. Use{" "}
                      {"{{variables}}"} for simple values or{" "}
                      {"{{json variable}}"} to stringify objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
