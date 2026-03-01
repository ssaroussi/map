import { MindNode } from '../types';
import { ROOT_RADIUS, HORIZONTAL_STEP, VERTICAL_SPACING, NODE_HEIGHT } from '../constants/layout';
import { getBranchColors } from '../constants/colors';

function getSubtreeHeight(nodes: Record<string, MindNode>, nodeId: string): number {
  const node = nodes[nodeId];
  if (!node || node.collapsed || node.children.length === 0) {
    return NODE_HEIGHT + VERTICAL_SPACING;
  }
  return node.children.reduce((sum, childId) => sum + getSubtreeHeight(nodes, childId), 0);
}

function layoutSubtree(
  nodes: Record<string, MindNode>,
  nodeId: string,
  direction: 1 | -1,
  topY: number
): void {
  const node = nodes[nodeId];
  if (!node || node.collapsed) return;

  let currentY = topY;

  for (const childId of node.children) {
    const child = nodes[childId];
    if (!child) continue;

    const slotHeight = getSubtreeHeight(nodes, childId);
    const childCenterY = currentY + slotHeight / 2;

    if (!child.manuallyPositioned) {
      child.x = node.x + direction * HORIZONTAL_STEP;
      child.y = childCenterY;
    }

    layoutSubtree(nodes, childId, direction, currentY);
    currentY += slotHeight;
  }
}

function propagateColor(nodes: Record<string, MindNode>, nodeId: string, color: string): void {
  const node = nodes[nodeId];
  if (!node) return;
  node.color = color;
  for (const childId of node.children) {
    propagateColor(nodes, childId, color);
  }
}

export function computeLayout(nodes: Record<string, MindNode>, rootId: string): void {
  const root = nodes[rootId];
  if (!root) return;

  root.x = 0;
  root.y = 0;

  const mainTopics = root.children;
  if (mainTopics.length === 0) return;

  // Assign colors
  mainTopics.forEach((childId, index) => {
    const child = nodes[childId];
    if (!child) return;
    const branchColors = getBranchColors();
    child.color = branchColors[index % branchColors.length];
    propagateColor(nodes, childId, child.color);
  });

  // All depth-1 nodes go to the RIGHT in a single vertical column, centered at y=0
  const totalHeight = mainTopics.reduce((sum, id) => sum + getSubtreeHeight(nodes, id), 0);
  let currentY = -totalHeight / 2;

  for (const childId of mainTopics) {
    const child = nodes[childId];
    if (!child) continue;

    const slotHeight = getSubtreeHeight(nodes, childId);
    const centerY = currentY + slotHeight / 2;

    if (!child.manuallyPositioned) {
      child.x = ROOT_RADIUS;
      child.y = centerY;
    }

    layoutSubtree(nodes, childId, 1, currentY);
    currentY += slotHeight;
  }
}
