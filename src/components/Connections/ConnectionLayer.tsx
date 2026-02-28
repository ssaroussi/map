import { useMapStore } from '../../store/mapStore';
import { BezierConnection } from './BezierConnection';

export function ConnectionLayer() {
  const nodes = useMapStore(s => s.nodes);

  const connections: Array<{ id: string; from: string; to: string }> = [];
  for (const node of Object.values(nodes)) {
    if (node.collapsed) continue;
    for (const childId of node.children) {
      connections.push({ id: `${node.id}-${childId}`, from: node.id, to: childId });
    }
  }

  return (
    <svg
      style={{
        position: 'absolute',
        left: '-5000px',
        top: '-5000px',
        width: '10000px',
        height: '10000px',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        {connections.map(({ id, from, to }) => {
          const fromNode = nodes[from];
          const toNode = nodes[to];
          if (!fromNode || !toNode) return null;
          return (
            <linearGradient key={id} id={`grad-${id}`} gradientUnits="userSpaceOnUse"
              x1={fromNode.x + 5000} y1={fromNode.y + 5000}
              x2={toNode.x + 5000} y2={toNode.y + 5000}>
              <stop offset="0%" stopColor={fromNode.color} />
              <stop offset="100%" stopColor={toNode.color} />
            </linearGradient>
          );
        })}
      </defs>
      {connections.map(({ id, from, to }) => {
        const fromNode = nodes[from];
        const toNode = nodes[to];
        if (!fromNode || !toNode) return null;
        const childNode = nodes[to];
        if (!childNode) return null;
        // Check if child is visible (not collapsed ancestor)
        return (
          <BezierConnection
            key={id}
            id={id}
            x1={fromNode.x + 5000}
            y1={fromNode.y + 5000}
            x2={toNode.x + 5000}
            y2={toNode.y + 5000}
            gradientId={`grad-${id}`}
          />
        );
      })}
    </svg>
  );
}
