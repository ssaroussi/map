import { MindNode } from '../types';
import { ROOT_RADIUS, HORIZONTAL_STEP, VERTICAL_SPACING, NODE_HEIGHT } from '../constants/layout';
import { BRANCH_COLORS } from '../constants/colors';

// Returns the total vertical height needed to render this subtree without overlap
function getSubtreeHeight(nodes: Record<string, MindNode>, nodeId: string): number {
  const node = nodes[nodeId];
  if (!node || node.collapsed || node.children.length === 0) {
    return NODE_HEIGHT + VERTICAL_SPACING;
  }
  return node.children.reduce((sum, childId) => sum + getSubtreeHeight(nodes, childId), 0);
}

// Lay out children of `nodeId` starting from `topY` (top of the allocated slot),
// extending horizontally in `direction`. Recurses into grandchildren.
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

// Layout a group of depth-1 siblings on one side of the root.
// Their X comes from the radial angle; their Y is stacked to prevent overlap.
function layoutSide(
  nodes: Record<string, MindNode>,
  ids: string[],
  angles: number[]
): void {
  // Total height of all subtrees on this side
  const totalHeight = ids.reduce((sum, id) => sum + getSubtreeHeight(nodes, id), 0);
  let currentY = -totalHeight / 2;

  ids.forEach((childId, i) => {
    const child = nodes[childId];
    if (!child) return;

    const slotHeight = getSubtreeHeight(nodes, childId);
    const centerY = currentY + slotHeight / 2;
    const direction: 1 | -1 = Math.cos(angles[i]) >= 0 ? 1 : -1;

    if (!child.manuallyPositioned) {
      child.x = Math.cos(angles[i]) * ROOT_RADIUS;
      child.y = centerY;
    }

    layoutSubtree(nodes, childId, direction, currentY);
    currentY += slotHeight;
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

export function computeLayout(nodes: Record<string, MindNode>, rootId: string): void {
  const root = nodes[rootId];
  if (!root) return;

  root.x = 0;
  root.y = 0;

  const mainTopics = root.children;
  if (mainTopics.length === 0) return;

  const angleStep = (2 * Math.PI) / mainTopics.length;

  // Assign colors first
  mainTopics.forEach((childId, index) => {
    const child = nodes[childId];
    if (!child) return;
    child.color = BRANCH_COLORS[index % BRANCH_COLORS.length];
    propagateColor(nodes, childId, child.color);
  });

  // Compute angle for each depth-1 node
  const angles = mainTopics.map((_, i) => i * angleStep - Math.PI / 2);

  // Split into right side (cos >= 0) and left side (cos < 0)
  const rightIds: string[] = [];
  const rightAngles: number[] = [];
  const leftIds: string[] = [];
  const leftAngles: number[] = [];

  mainTopics.forEach((childId, i) => {
    if (Math.cos(angles[i]) >= 0) {
      rightIds.push(childId);
      rightAngles.push(angles[i]);
    } else {
      leftIds.push(childId);
      leftAngles.push(angles[i]);
    }
  });

  layoutSide(nodes, rightIds, rightAngles);
  layoutSide(nodes, leftIds, leftAngles);
}
