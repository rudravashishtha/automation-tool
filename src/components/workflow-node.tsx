"use client";

import type { ReactNode } from "react";
import { NodeToolbar, Position } from "@xyflow/react";
import {
  ClipboardPasteIcon,
  CopyIcon,
  SettingsIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "./ui/button";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolbar?: boolean;
  showCopyButton?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  onCopyNode: (arg?: { copyData: boolean }) => void;
  name?: string;
  description?: string;
}

export function WorkflowNode({
  children,
  showToolbar = true,
  showCopyButton = true,
  onDelete,
  onSettings,
  onCopyNode,
  name,
  description,
}: WorkflowNodeProps) {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button size="sm" variant="ghost" onClick={onSettings}>
            <SettingsIcon className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <TrashIcon className="size-4" color="#E9192D" />
          </Button>
          {showCopyButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCopyNode()}
              title={"Copy node definition"}
            >
              <CopyIcon />
            </Button>
          )}
          {showCopyButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCopyNode({ copyData: true })}
              title={"Copy node data"}
            >
              <ClipboardPasteIcon />
            </Button>
          )}
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="max-w-[200px] text-center"
        >
          <p className="font-medium">{name}</p>
          {description && (
            <p className="text-muted-foreground truncate text-sm">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
}
