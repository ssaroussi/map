import { MindNode } from '../types';

export function getAncestors(nodes: Record<string, MindNode>, nodeId: string): string[] {
  const ancestors: string[] = [];
  let current = nodes[nodeId];
  while (current?.parentId) {
    ancestors.push(current.parentId);
    current = nodes[current.parentId];
  }
  return ancestors;
}

export function getDepth(nodes: Record<string, MindNode>, nodeId: string): number {
  let depth = 0;
  let current = nodes[nodeId];
  while (current?.parentId) {
    depth++;
    current = nodes[current.parentId];
  }
  return depth;
}

export function getAllDescendants(nodes: Record<string, MindNode>, nodeId: string): string[] {
  const result: string[] = [];
  const queue = [...(nodes[nodeId]?.children || [])];
  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    if (nodes[id]) {
      queue.push(...nodes[id].children);
    }
  }
  return result;
}

export function getSiblings(nodes: Record<string, MindNode>, nodeId: string): string[] {
  const node = nodes[nodeId];
  if (!node?.parentId) return [];
  return nodes[node.parentId]?.children || [];
}
