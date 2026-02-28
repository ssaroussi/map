import { NODE_WIDTH, NODE_HEIGHT } from '../constants/layout';

// Dimensions for root node (wider/taller than regular nodes)
const ROOT_WIDTH = 160;
const ROOT_HEIGHT = 52;

export function getNodeSize(isRoot: boolean) {
  return isRoot
    ? { w: ROOT_WIDTH, h: ROOT_HEIGHT }
    : { w: NODE_WIDTH, h: NODE_HEIGHT };
}

/**
 * Computes a bezier path from the edge of the parent node to the edge of the
 * child node. The connection exits/enters from the left or right side depending
 * on which side the child is relative to the parent.
 */
export function getBezierPath(
  px: number, py: number, pIsRoot: boolean,
  cx: number, cy: number, _cIsRoot: boolean
): string {
  const { w: pw } = getNodeSize(pIsRoot);
  const { w: cw } = getNodeSize(_cIsRoot);

  // Child is to the right of parent → exit right edge, enter left edge
  const childOnRight = cx >= px;

  const x1 = childOnRight ? px + pw / 2 : px - pw / 2;
  const y1 = py;
  const x2 = childOnRight ? cx - cw / 2 : cx + cw / 2;
  const y2 = cy;

  const dx = Math.abs(x2 - x1);
  const cp = Math.max(dx * 0.5, 60);

  const cp1x = childOnRight ? x1 + cp : x1 - cp;
  const cp2x = childOnRight ? x2 - cp : x2 + cp;

  return `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
}
