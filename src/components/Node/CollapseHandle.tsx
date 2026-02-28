import { useMapStore } from '../../store/mapStore';

interface Props {
  nodeId: string;
  color: string;
}

export function CollapseHandle({ nodeId, color }: Props) {
  const toggleCollapse = useMapStore(s => s.toggleCollapse);
  const node = useMapStore(s => s.nodes[nodeId]);
  if (!node || node.children.length === 0) return null;

  // Place the handle on the side where children extend
  const onRight = node.x >= 0;

  return (
    <button
      data-node
      onClick={(e) => { e.stopPropagation(); toggleCollapse(nodeId); }}
      style={{
        position: 'absolute',
        ...(onRight ? { right: '-12px' } : { left: '-12px' }),
        top: '50%',
        transform: 'translateY(-50%)',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: color,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        color: '#0a0a0f',
        fontWeight: 'bold',
        lineHeight: 1,
        zIndex: 10,
        padding: 0,
      }}
    >
      {node.collapsed ? '+' : '−'}
    </button>
  );
}
