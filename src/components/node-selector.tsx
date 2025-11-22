"use client";

import React, { useCallback, useMemo, useState } from "react";
import { createId } from "@paralleldrive/cuid2";
import { toast } from "sonner";
import { NodeType } from "@/generated/prisma";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  GlobeIcon,
  MonitorIcon,
  MousePointerIcon,
  SearchIcon,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { useReactFlow } from "@xyflow/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export type NodeCategory = "trigger" | "ai" | "utility" | "output";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
  category: NodeCategory;
  badge?: string;
};

const NODE_OPTIONS: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Trigger Manually",
    description:
      "Start the flow whenever you want with a simple click. Perfect for quick actions.",
    icon: MousePointerIcon,
    category: "trigger",
    badge: "Trigger",
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form",
    description: "Runs the flow when a Google Form is submitted.",
    icon: "/logos/googleform.svg",
    category: "trigger",
    badge: "Trigger",
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe Event",
    description: "Runs the flow when a Stripe event is captured.",
    icon: "/logos/stripe.svg",
    category: "trigger",
    badge: "Trigger",
  },
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description:
      "Connect to any website or API to get or send information as part of your flow.",
    icon: GlobeIcon,
    category: "utility",
    badge: "Utility",
  },
  {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Use Google Gemini to generate responses based on prompts.",
    icon: "/logos/gemini.svg",
    category: "ai",
    badge: "LLM",
  },
  {
    type: NodeType.OPENAI,
    label: "OpenAI",
    description: "Use OpenAI to generate responses based on prompts.",
    icon: "/logos/openai.svg",
    category: "ai",
    badge: "LLM",
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic",
    description: "Use Anthropic to generate responses based on prompts.",
    icon: "/logos/anthropic.svg",
    category: "ai",
    badge: "LLM",
  },
  {
    type: NodeType.DEEPSEEK,
    label: "Deepseek",
    description: "Use Deepseek to generate responses based on prompts.",
    icon: "/logos/deepseek.svg",
    category: "ai",
    badge: "LLM",
  },
  {
    type: NodeType.GROK,
    label: "Grok",
    description: "Use Grok to generate responses based on prompts.",
    icon: "/logos/grok.svg",
    category: "ai",
    badge: "LLM",
  },
  {
    type: NodeType.DISPLAY,
    label: "Display",
    description: "Show results in a window.",
    icon: MonitorIcon,
    category: "output",
    badge: "Output",
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { getNodes, setNodes, screenToFlowPosition } = useReactFlow();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | NodeCategory>("all");

  const handleNodeSelect = useCallback(
    (selectedNode: NodeTypeOption) => {
      if (selectedNode.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();
        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER
        );

        if (hasManualTrigger) {
          toast.error("You can only have one manual trigger!");
          return;
        }
      }

      setNodes((currNodes) => {
        const hasInitialTrigger = currNodes.some(
          (node) => node.type === NodeType.INITIAL
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: selectedNode.type,
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...currNodes, newNode];
      });

      onOpenChange(false);
    },
    [getNodes, setNodes, screenToFlowPosition, onOpenChange]
  );

  const filteredOptions = useMemo(() => {
    const term = search.toLowerCase().trim();

    return NODE_OPTIONS.filter((option) => {
      if (activeTab !== "all" && option.category !== activeTab) return false;
      if (!term) return true;
      return (
        option.label.toLowerCase().includes(term) ||
        option.description.toLowerCase().includes(term)
      );
    });
  }, [search, activeTab]);

  const renderNodeCard = (nodeType: NodeTypeOption) => {
    const Icon = nodeType.icon;

    return (
      <Button
        key={nodeType.type}
        variant="outline"
        type="button"
        onClick={() => handleNodeSelect(nodeType)}
        className="flex w-full h-auto flex-col items-stretch justify-start gap-2 rounded-lg border border-border/70 bg-background/80 px-4 py-3 text-left shadow-sm transition-all hover:border-primary/60 hover:bg-accent/70 hover:shadow-md"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
            {typeof Icon === "string" ? (
              <img
                src={Icon}
                alt={nodeType.label}
                className="h-5 w-5 object-contain"
              />
            ) : (
              <Icon className="h-5 w-5" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate text-sm font-medium">
                {nodeType.label}
              </span>
              {nodeType.badge && (
                <Badge
                  variant="secondary"
                  className="shrink-0 rounded-full px-2 py-0 text-[10px] font-medium uppercase tracking-wide"
                >
                  {nodeType.badge}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {nodeType.description}
            </p>
          </div>
        </div>
      </Button>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto px-4"
      >
        <SheetHeader className="space-y-2 px-0">
          <SheetTitle>Add a step</SheetTitle>
          <SheetDescription>
            Choose how this workflow starts, which AI or tools it uses, and how
            it shows the result.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes (e.g. OpenAI, HTTP, trigger)..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as typeof activeTab)}
          >
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="trigger" className="text-xs">
                Triggers
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                AI / Models
              </TabsTrigger>
              <TabsTrigger value="utility" className="text-xs">
                Utilities
              </TabsTrigger>
              <TabsTrigger value="output" className="text-xs">
                Output
              </TabsTrigger>
            </TabsList>

            <Separator className="my-3" />

            <TabsContent value={activeTab} className="mt-0">
              {filteredOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground mt-4">
                  No nodes match your search.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredOptions.map(renderNodeCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
