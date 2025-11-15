import { Connection, Node } from "@/generated/prisma";
import toposort from "toposort";
import { inngest } from "./client";

export const toplogicalSort = (
  nodes: Node[],
  connections: Connection[]
): Node[] => {
  // If no connections, return node as is.
  if (connections.length === 0) {
    return nodes;
  }

  // Create edges array for topological sort.
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  // Add nodes with no connections as self-edges. This ensures that they are included in the sorted list.
  const connectedNodeIds = new Set<string>();
  for (const conne of connections) {
    connectedNodeIds.add(conne.fromNodeId);
    connectedNodeIds.add(conne.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  // Perform topological sort and remove duplicates
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    // Remove duplicates (from self-edges)
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (err) {
    if (err instanceof Error && err.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw err;
  }

  // Map sorted ids back to nodes
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
  });
};
