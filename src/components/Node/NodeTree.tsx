import { AnimatePresence } from 'framer-motion';
import { useMapStore } from '../../store/mapStore';
import { MindNode } from './MindNode';

interface Props {
  nodeId: string;
  isRoot?: boolean;
}

export function NodeTree({ nodeId, isRoot }: Props) {
  const node = useMapStore(s => s.nodes[nodeId]);
  if (!node) return null;

  return (
    <>
      <MindNode nodeId={nodeId} isRoot={isRoot} />
      {!node.collapsed && (
        <AnimatePresence>
          {node.children.map(childId => (
            <NodeTree key={childId} nodeId={childId} />
          ))}
        </AnimatePresence>
      )}
    </>
  );
}
