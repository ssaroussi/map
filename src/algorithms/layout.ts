import { MindNode } from '../types';
import { ROOT_RADIUS, HORIZONTAL_STEP, VERTICAL_SPACING, NODE_HEIGHT } from '../constants/layout';
import { BRANCH_COLORS } from '../constants/colors';

function getSubtreeHeight(nodes: Record<string, MindNode>, nodeId: string): number {
  const node = nodes[nodeId];
  if (!node || node.collapsed || node.children.length === 0) {
    return NODE_HEIGHT + VERTICAL_SPACING;
  }
  return node.children.reduce((sum, childId) => {
    return sum + getSubtreeHeight(nodes, childId);
  }, 0);
}

function layoutSubtree(
  nodes: Record<string, MindNode>,
  nodeId: string,
  direction: 1 | -1,
  startY: number
): void {
  const node = nodes[nodeId];
  if (!node || node.collapsed) return;

  const totalHeight = node.children.reduce((sum, childId) => {
    return sum + getSubtreeHeight(nodes, childId);
  }, 0);

  let currentY = startY - totalHeight / 2;

  for (const childId of node.children) {
    const child = nodes[childId];
    if (!child) continue;

    const childHeight = getSubtreeHeight(nodes, childId);
    const childCenterY = currentY + childHeight / 2;

    if (!child.manuallyPositioned) {
      child.x = node.x + direction * HORIZONTAL_STEP;
      child.y = childCenterY;
    }

    layoutSubtree(nodes, childId, direction, childCenterY);
    currentY += childHeight;
  }
}

export function computeLayout(nodes: Record<string, MindNode>, rootId: string): void {
  const root = nodes[rootId];
  if (!root) return;

  root.x = 0;
  root.y = 0;

  const mainTopics = root.children;
  if (mainTopics.length === 0) return;

  const angleStep = (2 * Math.PI) / mainTopics.length;

  mainTopics.forEach((childId, index) => {
    const child = nodes[childId];
    if (!child) return;

    const angle = index * angleStep - Math.PI / 2;
    child.color = BRANCH_COLORS[index % BRANCH_COLORS.length];

    if (!child.manuallyPositioned) {
      child.x = Math.cos(angle) * ROOT_RADIUS;
      child.y = Math.sin(angle) * ROOT_RADIUS;
    }

    // Propagate color to descendants
    propagateColor(nodes, childId, child.color);

    // Direction: right if node is on right half, left otherwise
    const direction: 1 | -1 = child.x >= 0 ? 1 : -1;
    layoutSubtree(nodes, childId, direction, child.y);
  });
}

function propagateColor(nodes: Record<string, MindNode>, nodeId: string, color: string): void {
  const node = nodes[nodeId];
  if (!node) return;
  node.color = color;
  for (const childId of node.children) {
    propagateColor(nodes, childId, color);
  }
}
