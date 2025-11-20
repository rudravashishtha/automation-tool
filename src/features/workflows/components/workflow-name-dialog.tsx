"use client";

import { useEffect } from "react";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().max(50, "Name must be 50 characters or less").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkflowNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  defaultName?: string;
}

export const WorkflowNameDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  title = "Workflow Name",
  description = "Enter a name for your workflow",
  defaultName = "",
}: WorkflowNameDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName,
    },
  });

  // Reset form when dialog opens with new default name
  useEffect(() => {
    if (open) {
      form.reset({
        name: defaultName,
      });
    }
  }, [open, defaultName, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values.name || "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter workflow name..."
                      {...field}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(handleSubmit)();
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a descriptive name for your workflow or leave it
                    blank to use a default name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
