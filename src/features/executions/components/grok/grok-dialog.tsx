"use client";

import { useEffect, useState } from "react";
import z from "zod";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";

export const AVAILABLE_MODELS = [
  "grok-3-mini",
  "grok-3-mini-latest",
  "grok-3-mini-fast",
  "grok-3-mini-fast-latest",
  "grok-3-fast",
  "grok-3-fast-latest",
  "grok-3",
  "grok-3-latest",
  "grok-4-0709",
  "grok-4",
  "grok-4-latest",
  "grok-code-fast-1",
  "grok-4-fast-non-reasoning",
  "grok-4-fast-reasoning",
] as const;

const formSchema = z.object({
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  variableName: z
    .string()
    .min(1, {
      message: "Variable Name is required.",
    })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and may contain only letters, numbers, and underscores.",
    }),
  credentialId: z.string().min(1, "Credential is required."),
});

export type GrokFormValues = z.infer<typeof formSchema>;

interface GrokDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<GrokFormValues>;
}

export const GrokDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: GrokDialogProps) => {
  const { data: credentials = [], isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.GROK);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
    },
    resolver: zodResolver(formSchema),
  });

  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(
    Boolean(defaultValues.systemPrompt)
  );

  // Reset form values when dialog opens with new defaults
  useEffect(() => {
    if (open)
      form.reset({
        model: defaultValues.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
      });
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myModel";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[min(90vw,640px)] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Grok Configuration</DialogTitle>
          <DialogDescription>
            Configure the AI model and prompts for this node.
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
                      <Input placeholder="myModel" {...field} />
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
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credential</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingCredentials || !credentials.length}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentials.map((credential) => (
                          <SelectItem key={credential.id} value={credential.id}>
                            <Image
                              src="/logos/grok.svg"
                              alt="Grok"
                              width={16}
                              height={16}
                            />
                            {credential.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select a Model"
                            defaultValue={AVAILABLE_MODELS[0]}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The Grok Model to use for this request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize the following text into bullet points: {{json response.data}}"
                        className="min-h-[120px] max-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The prompt will be sent to the AI model . Use{" "}
                      {"{{variables}}"} for simple values or{" "}
                      {"{{json variable}}"} to stringify objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="flex items-center">
                <Switch
                  checked={showSystemPrompt}
                  onCheckedChange={(checked) => setShowSystemPrompt(checked)}
                />
                <FormDescription>Advanced Options</FormDescription>
              </FormItem>

              {showSystemPrompt && (
                <FormField
                  control={form.control}
                  name="systemPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Prompt (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="You are a helpful assistant."
                          className="min-h-[80px] max-h-[200px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Sets the behaviour of the assistant. Use{" "}
                        {"{{variables}}"} for simple values or{" "}
                        {"{{json variable}}"} to stringify objects
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
