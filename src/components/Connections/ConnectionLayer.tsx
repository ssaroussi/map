import { useMapStore } from '../../store/mapStore';
import { BezierConnection } from './BezierConnection';

export function ConnectionLayer() {
  const nodes = useMapStore(s => s.nodes);
  const rootId = useMapStore(s => s.rootId);

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
        {/* Arrowhead marker per connection color — one per child node color */}
        {connections.map(({ id, to }) => {
          const toNode = nodes[to];
          if (!toNode) return null;
          return (
            <marker
              key={`arrow-${id}`}
              id={`arrow-${id}`}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M 0 0 L 6 3 L 0 6 z" fill={toNode.color} />
            </marker>
          );
        })}

        {/* Gradient per connection */}
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
        return (
          <BezierConnection
            key={id}
            id={id}
            fromX={fromNode.x + 5000}
            fromY={fromNode.y + 5000}
            fromIsRoot={from === rootId}
            toX={toNode.x + 5000}
            toY={toNode.y + 5000}
            toIsRoot={false}
            gradientId={`grad-${id}`}
            arrowId={`arrow-${id}`}
          />
        );
      })}
    </svg>
  );
}
