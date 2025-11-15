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
import { tryParseHeaders } from "./utils";

const headersValidation = z
  .string()
  .transform((v) => (v == null ? "" : v))
  .refine(
    (val) => {
      if (val.trim() === "") return true; // allow empty
      try {
        tryParseHeaders(val);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Invalid headers. Provide a JSON object.",
    }
  );

const formSchema = z.object({
  headers: headersValidation,
  endpoint: z.url({
    message: "Please enter a valid URL.",
  }),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  body: z.string().optional(),
  variableName: z
    .string()
    .min(1, {
      message: "Variable Name is required.",
    })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and may contain only letters, numbers, and underscores.",
    }),
});

export type HttpRequestFormValues = z.infer<typeof formSchema>;

interface HttpRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<HttpRequestFormValues>;
}

export const HttpRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: HttpRequestDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      headers: defaultValues.headers || "",
      endpoint: defaultValues.endpoint || "",
      method: defaultValues.method || "GET",
      body: defaultValues.body || "",
      variableName: defaultValues.variableName || "",
    },
    resolver: zodResolver(formSchema),
  });

  // Reset form values when dialog opens with new defaults
  useEffect(() => {
    if (open)
      form.reset({
        headers: defaultValues.headers || "",
        endpoint: defaultValues.endpoint || "",
        method: defaultValues.method || "GET",
        body: defaultValues.body || "",
        variableName: defaultValues.variableName || "",
      });
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "myApiCall";
  const watchMethod = form.watch("method");
  const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[min(90vw,640px)] overflow-hidden">
        <DialogHeader>
          <DialogTitle>HTTP Request</DialogTitle>
          <DialogDescription>
            Configure settings for the HTTP Request Node.
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
                      <Input placeholder="myApiCall" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the response in subsequent
                      nodes: {`{{${watchVariableName}.httpResponse.data}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headers</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='{"Authorization": "Bearer {{authToken}}", "X-User": "{{user.id}}"}'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide headers as key-value pairs. You can use{" "}
                      {"{{variables}}"} for simple values or{" "}
                      {"{{json variable}}"} to inject stringified objects.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The HTTP method to use for the request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Static URL or use {"{{variables}}"} for simple values or{" "}
                      {"{{json variable}}"} to stringify objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {showBodyField && (
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Body</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            '{\n  "userId": "{{httpResponse.data.id}}", \n  "name": "{{httpResponse.data.name}}", \n  "email": "{{httpResponse.data.email}}"\n}'
                          }
                          className="min-h-[120px] max-h-[200px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        JSON with template variables. Use {"{{variables}}"} for
                        simple values or {"{{json variable}}"} to stringify
                        object
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Footer stays visible — not inside the scrollable area */}
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
