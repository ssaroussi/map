export function getBezierPath(
  x1: number, y1: number,
  x2: number, y2: number
): string {
  const dx = x2 - x1;
  const cp = Math.max(Math.abs(dx) * 0.5, 60);
  return `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;
}
