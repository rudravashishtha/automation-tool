"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SquareStackIcon } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Utility: compute layered layout using Kahn's algorithm (BFS by layers).
 * Returns a Map<depth, string[]> and a Map<id, depth>
 */
function computeLayers(
  nodes: { id: string }[],
  edges: { source: string; target: string }[]
) {
  const inDegree = new Map<string, number>();
  const children = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    children.set(n.id, []);
  }
  for (const e of edges) {
    // ignore edges referencing missing nodes
    if (!inDegree.has(e.source) || !inDegree.has(e.target)) continue;
    children.get(e.source)!.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  }

  // Kahn's algorithm but we produce layers:
  const layers = new Map<number, string[]>();
  const nodeDepth = new Map<string, number>();

  // start with nodes with indegree 0
  let queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  let depth = 0;
  const visited = new Set<string>();

  while (queue.length) {
    const nextQueue: string[] = [];
    layers.set(depth, [...queue]); // preserve order of queue for stability

    for (const id of queue) {
      nodeDepth.set(id, depth);
      visited.add(id);
      const ch = children.get(id) || [];
      for (const c of ch) {
        inDegree.set(c, (inDegree.get(c) || 1) - 1);
        if (inDegree.get(c) === 0) {
          nextQueue.push(c);
        }
      }
    }

    queue = nextQueue;
    depth++;
  }

  // Nodes in cycles or with remaining indegree > 0 will not be visited.
  // Place any unvisited nodes into subsequent depths (preserve original nodes order)
  let extraDepth = depth;
  for (const n of nodes) {
    if (!visited.has(n.id)) {
      layers.set(extraDepth, [...(layers.get(extraDepth) || []), n.id]);
      nodeDepth.set(n.id, extraDepth);
      extraDepth++;
    }
  }

  return { layers, nodeDepth };
}

export const CleanLayoutButton = memo(() => {
  const { getNodes, getEdges, setNodes, screenToFlowPosition } = useReactFlow();

  const [xSpacing, setXSpacing] = useState(200);
  const [ySpacing, setYSpacing] = useState(180);
  const [autoApply, setAutoApply] = useState(false);

  // refs to read latest values inside stable callbacks
  const xRef = useRef(xSpacing);
  const yRef = useRef(ySpacing);
  const autoApplyRef = useRef(autoApply);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    xRef.current = xSpacing;
  }, [xSpacing]);
  useEffect(() => {
    yRef.current = ySpacing;
  }, [ySpacing]);
  useEffect(() => {
    autoApplyRef.current = autoApply;
  }, [autoApply]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // stable layout function (reads spacing from refs)
  const handleClean = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const { layers } = computeLayers(nodes, edges);

    // viewport centering (fallback to window)
    const centerY = window.innerHeight / 2;
    const centerX = window.innerWidth / 2;

    // find max depth and prepare positions
    const depths = Array.from(layers.keys()).sort((a, b) => a - b);
    const maxDepth = depths.length ? Math.max(...depths) : 0;
    const totalWidth = xRef.current * Math.max(0, maxDepth);
    const startX = Math.max(80, centerX - totalWidth / 2);

    const positions = new Map<string, { x: number; y: number }>();
    for (let dIndex = 0; dIndex < depths.length; dIndex++) {
      const d = depths[dIndex];
      const ids = layers.get(d) || [];
      const totalHeight = yRef.current * Math.max(0, ids.length - 1);
      const startY = Math.max(80, centerY - totalHeight / 2);
      const x = startX + dIndex * xRef.current;
      for (let i = 0; i < ids.length; i++) {
        positions.set(ids[i], { x, y: startY + i * yRef.current });
      }
    }

    // update nodes — only apply when position changed
    setNodes((curr) =>
      curr.map((n) => {
        const pos = positions.get(n.id);
        if (!pos) return n;
        const flowPos = screenToFlowPosition(pos);
        // check shallow equality to avoid unnecessary updates
        if (
          n.position &&
          typeof n.position.x === "number" &&
          typeof n.position.y === "number" &&
          Math.abs(n.position.x - flowPos.x) < 0.5 &&
          Math.abs(n.position.y - flowPos.y) < 0.5
        ) {
          return n;
        }
        return { ...n, position: flowPos };
      })
    );
    // end handleClean
  }, [getNodes, getEdges, setNodes, screenToFlowPosition]);

  // helper: schedule apply when sliders change if autoApply is true (debounced)
  const scheduleAutoApply = useCallback(() => {
    if (!autoApplyRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      handleClean();
    }, 150) as unknown as number;
  }, [handleClean]);

  // If the Slider component exposes an `onCommit` / `onValueCommit` event, prefer to call handleClean there.
  // If not, we use pointerUp on the container to detect "stop dragging".

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="bg-background"
          size="icon"
          variant="outline"
          title="Clean layout"
        >
          <SquareStackIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Horizontal spacing</span>
            <span className="text-xs tabular-nums">{xSpacing}px</span>
          </div>

          {/* Wrap slider so we can catch pointerUp when user stops dragging */}
          <div
            onPointerUp={() => {
              // apply when user stops dragging if autoApply is false (explicit apply)
              if (!autoApplyRef.current) {
                // if user stops dragging and autoApply is off, do nothing
                // if you prefer to apply automatically on stop even when autoApply is off, call handleClean()
              } else {
                // if autoApply is true then we already debounced schedule; but make sure final apply happens
                if (debounceRef.current) clearTimeout(debounceRef.current);
                handleClean();
              }
            }}
          >
            <Slider
              min={80}
              max={480}
              step={10}
              value={[xSpacing]}
              onValueChange={(v) => {
                setXSpacing(v[0]);
                // schedule only when autoApply true
                scheduleAutoApply();
              }}
              // If your slider supports a commit event use it:
              // onValueCommit={() => { if (!autoApply) handleClean(); }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Vertical spacing</span>
            <span className="text-xs tabular-nums">{ySpacing}px</span>
          </div>

          <div
            onPointerUp={() => {
              if (!autoApplyRef.current) {
                // no-op by default
              } else {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                handleClean();
              }
            }}
          >
            <Slider
              min={80}
              max={480}
              step={10}
              value={[ySpacing]}
              onValueChange={(v) => {
                setYSpacing(v[0]);
                scheduleAutoApply();
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={autoApply}
              onCheckedChange={(checked) => setAutoApply(Boolean(checked))}
            />
            <span className="text-xs">Apply on change</span>
          </div>

          {!autoApply && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // apply once when user presses Apply button
                  // clear any debounce and run immediately
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  handleClean();
                }}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

CleanLayoutButton.displayName = "CleanLayoutButton";
