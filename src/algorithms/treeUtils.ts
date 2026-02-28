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
  const siblings = nodes[node.parentId]?.children || [];
  // Sort by actual Y position so keyboard navigation follows visual order
  return [...siblings].sort((a, b) => (nodes[a]?.y ?? 0) - (nodes[b]?.y ?? 0));
}

function sortedChildren(nodes: Record<string, MindNode>, nodeId: string): string[] {
  const node = nodes[nodeId];
  if (!node) return [];
  return [...node.children].sort((a, b) => (nodes[a]?.y ?? 0) - (nodes[b]?.y ?? 0));
}

/**
 * Next node in DFS pre-order:
 * 1. First child (if any and not collapsed)
 * 2. Next sibling
 * 3. Parent's next sibling, grandparent's next sibling… (walk up until found)
 */
export function getNextNode(nodes: Record<string, MindNode>, nodeId: string): string | null {
  const node = nodes[nodeId];
  if (!node) return null;

  // Go deeper if possible
  if (!node.collapsed && node.children.length > 0) {
    return sortedChildren(nodes, nodeId)[0];
  }

  // Walk up until we find a next sibling
  let current = node;
  while (current) {
    if (!current.parentId) return null;
    const siblings = getSiblings(nodes, current.id);
    const idx = siblings.indexOf(current.id);
    if (idx < siblings.length - 1) return siblings[idx + 1];
    current = nodes[current.parentId];
  }
  return null;
}

/**
 * Previous node in DFS pre-order:
 * 1. Last deepest descendant of previous sibling
 * 2. Parent (if no previous sibling)
 */
export function getPrevNode(nodes: Record<string, MindNode>, nodeId: string): string | null {
  const node = nodes[nodeId];
  if (!node?.parentId) return null;

  const siblings = getSiblings(nodes, nodeId);
  const idx = siblings.indexOf(nodeId);

  if (idx > 0) {
    // Dive into the deepest last descendant of the previous sibling
    let cursor = siblings[idx - 1];
    while (true) {
      const n = nodes[cursor];
      if (!n || n.collapsed || n.children.length === 0) break;
      const ch = sortedChildren(nodes, cursor);
      cursor = ch[ch.length - 1];
    }
    return cursor;
  }

  // No previous sibling — go to parent
  return node.parentId;
}
