import { useEffect, useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

const createFormSchema = <T extends readonly string[]>(availableModels: T) =>
  z.object({
    model: z
      .string()
      .refine((val) => availableModels.includes(val as T[number]), {
        message: "Invalid model selected",
      }),
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

export type AIDialogFormValues<T extends readonly string[]> = {
  model: T[number];
  systemPrompt?: string;
  userPrompt: string;
  variableName: string;
  credentialId: string;
};

type AINodesDialogProps<T extends readonly string[]> = {
  availableModels: T;
  defaultValues?: Partial<AIDialogFormValues<T>>;
  agentTitle: string;
  open: boolean;
  type: CredentialType;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AIDialogFormValues<T>) => void;
};

export const createAiNodeFormSchema = <T extends readonly string[]>(
  availableModels: T
) => {
  return z.object({
    model: z
      .string()
      .refine((val) => availableModels.includes(val as T[number]), {
        message: "Invalid model selected",
      }),
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
};

export interface AiNodeDialogParentProps<T extends readonly string[]> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AIDialogFormValues<T>) => void;
  defaultValues?: Partial<AIDialogFormValues<T>>;
}

const AINodesDialog = <T extends readonly string[]>(
  props: AINodesDialogProps<T>
) => {
  const {
    availableModels,
    defaultValues = {},
    type,
    agentTitle,
    open,
    onOpenChange,
    onSubmit,
  } = props;

  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(
    Boolean(defaultValues.systemPrompt)
  );

  const { data: credentials = [], isLoading: isLoadingCredentials } =
    useCredentialsByType(type);

  const formSchema = createFormSchema(availableModels);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      model: defaultValues.model || availableModels[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
    },
    resolver: zodResolver(formSchema),
  });

  const watchVariableName = form.watch("variableName") || "myModel";

  const fallbackModel = availableModels[0] ?? "";

  // Reset form values when dialog opens with new defaults
  useEffect(() => {
    if (open)
      form.reset({
        model: defaultValues.model || fallbackModel,
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
      });
  }, [open, defaultValues, form, fallbackModel]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[min(90vw,640px)] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{agentTitle} Configuration</DialogTitle>
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
                          <SelectValue placeholder="Select Credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentials.map((credential) => (
                          <SelectItem
                            key={credential.name}
                            value={credential.name}
                          >
                            {credential.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The {agentTitle} Model to use for this request.
                    </FormDescription>
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
                          <SelectValue placeholder="Select a Model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableModels.map((model: any) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The {agentTitle} Model to use for this request.
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
                      The prompt will be sent to the AI model. Use{" "}
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

export default AINodesDialog as <T extends readonly string[]>(
  props: AINodesDialogProps<T>
) => ReturnType<typeof AINodesDialog>;
