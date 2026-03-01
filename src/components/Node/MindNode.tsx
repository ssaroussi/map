import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useMapStore } from '../../store/mapStore';
import { NodeEditor } from './NodeEditor';
import { NodeLabel } from './NodeLabel';
import { CollapseHandle } from './CollapseHandle';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/layout';

interface Props {
  nodeId: string;
  isRoot?: boolean;
}

export function MindNode({ nodeId, isRoot }: Props) {
  const node = useMapStore(s => s.nodes[nodeId]);
  const selectedId = useMapStore(s => s.selectedId);
  const editingId = useMapStore(s => s.editingId);
  const setSelected = useMapStore(s => s.setSelected);
  const setEditing = useMapStore(s => s.setEditing);
  const setContextMenu = useMapStore(s => s.setContextMenu);
  const moveNode = useMapStore(s => s.moveNode);
  const viewport = useMapStore(s => s.viewport);

  const dragStart = useRef<{ mx: number; my: number; nx: number; ny: number } | null>(null);
  const hasDragged = useRef(false);

  if (!node) return null;

  const isSelected = selectedId === nodeId;
  const isEditing = editingId === nodeId;

  const width = isRoot ? 160 : NODE_WIDTH;
  const height = isRoot ? 52 : NODE_HEIGHT;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    dragStart.current = { mx: e.clientX, my: e.clientY, nx: node.x, ny: node.y };
    hasDragged.current = false;

    const onMove = (me: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = (me.clientX - dragStart.current.mx) / viewport.scale;
      const dy = (me.clientY - dragStart.current.my) / viewport.scale;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged.current = true;
        moveNode(nodeId, dragStart.current.nx + dx, dragStart.current.ny + dy);
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!hasDragged.current) setSelected(nodeId);
      dragStart.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [node.x, node.y, nodeId, viewport.scale, moveNode, setSelected]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(nodeId);
    setEditing(nodeId);
  }, [nodeId, setSelected, setEditing]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(nodeId);
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  }, [nodeId, setSelected, setContextMenu]);

  const defaultShadow = isRoot
    ? `0 4px 20px ${node.color}40`
    : `0 2px 8px rgba(0,0,0,0.3)`;

  const glowStyle = isSelected
    ? { boxShadow: `0 0 0 2px ${node.color}, 0 0 24px ${node.color}80` }
    : { boxShadow: defaultShadow };

  return (
    <motion.div
      data-node="true"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, ...glowStyle }}
      exit={{ scale: 0.5, opacity: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        position: 'absolute',
        left: node.x - width / 2,
        top: node.y - height / 2,
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isRoot ? 'var(--t-root-bg)' : 'var(--t-surface)',
        border: `1.5px solid ${isRoot ? node.color + '60' : isSelected ? node.color : 'var(--t-border)'}`,
        borderRadius: '10px',
        color: 'var(--t-text)',
        fontSize: isRoot ? '15px' : '13px',
        fontWeight: isRoot ? 700 : 500,
        cursor: isEditing ? 'text' : 'pointer',
        padding: '0 12px',
        textAlign: 'center',
        overflow: 'visible',
        zIndex: isSelected ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {isEditing ? (
        <NodeEditor nodeId={nodeId} />
      ) : (
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          color: isRoot ? node.color : 'var(--t-text)',
          transition: 'color 0.2s ease',
        }}>
          {node.title || (isRoot ? 'Map' : 'New Node')}
        </span>
      )}
      <NodeLabel label={node.label} color={node.color} />
      {!isRoot && <CollapseHandle nodeId={nodeId} color={node.color} />}
    </motion.div>
  );
}
